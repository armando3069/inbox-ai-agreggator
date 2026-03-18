import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_DEFAULTS } from '../common/constants';

// pdf-parse v1 exports the parse function directly via module.exports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const parsePdf: (buf: Buffer) => Promise<{ text: string; numpages: number }> =
  require('pdf-parse');

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredFile {
  name: string;       // original display name
  storedAs: string;   // filename on disk (with timestamp prefix)
  pages: number;      // page count
  uploadedAt: string;
}

interface UserKnowledge {
  userId: number;
  files: StoredFile[];
}

export interface IndexedFile {
  name: string;
  chunks: number;     // holds page count (kept for frontend compatibility)
  uploadedAt: string;
}

// ── System prompt ─────────────────────────────────────────────────────────────

const RAG_SYSTEM_PROMPT =
  "You are an assistant that answers ONLY based on the context from the user's knowledge base (PDF documents). " +
  'Answer in Romanian. ' +
  'If the answer is not clearly in the provided context, reply exactly: "Nu știu, nu este în document." ' +
  'Do not invent anything.';

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  private readonly knowledgeByUser = new Map<number, UserKnowledge>();

  constructor(private readonly config: ConfigService) {}

  // ── Claude client ──────────────────────────────────────────────────────────

  private getClient(): Anthropic {
    return new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY') ?? '',
    });
  }

  private getModelName(): string {
    return this.config.get<string>('CLAUDE_MODEL') ?? CLAUDE_DEFAULTS.model;
  }

  // ── Disk persistence (metadata only) ─────────────────────────────────────

  private indexPath(userId: number): string {
    return join(process.cwd(), 'uploads', String(userId), 'kb-index.json');
  }

  private saveIndex(knowledge: UserKnowledge): void {
    try {
      writeFileSync(this.indexPath(knowledge.userId), JSON.stringify(knowledge), 'utf-8');
    } catch (e) {
      this.logger.warn(`[KB] Could not persist index for user ${knowledge.userId}`, e);
    }
  }

  private loadIndex(userId: number): UserKnowledge | null {
    const path = this.indexPath(userId);
    if (!existsSync(path)) return null;
    try {
      const raw = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
      if (Array.isArray(raw.files)) {
        const files: StoredFile[] = (raw.files as Array<Record<string, unknown>>).map((f) => ({
          name:       String(f.name       ?? ''),
          storedAs:   String(f.storedAs   ?? ''),
          pages:      Number(f.pages      ?? f.chunks ?? 1),
          uploadedAt: String(f.uploadedAt ?? ''),
        }));
        return { userId, files };
      }
      return null;
    } catch (e) {
      this.logger.warn(`[KB] Could not read index for user ${userId}`, e);
      return null;
    }
  }

  private getOrLoad(userId: number): UserKnowledge | null {
    if (this.knowledgeByUser.has(userId)) return this.knowledgeByUser.get(userId)!;
    const fromDisk = this.loadIndex(userId);
    if (fromDisk) {
      this.knowledgeByUser.set(userId, fromDisk);
      this.logger.log(`[KB] Restored ${fromDisk.files.length} file(s) for user ${userId} from disk`);
      return fromDisk;
    }
    return null;
  }

  // ── Index PDF for a user ──────────────────────────────────────────────────

  async indexPdfForUser(
    userId: number,
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<{ chunks: number; storedAs: string }> {
    // 1. Save PDF to disk
    const userDir  = join(process.cwd(), 'uploads', String(userId));
    mkdirSync(userDir, { recursive: true });

    const timestamp = Date.now();
    const safeName  = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    writeFileSync(join(userDir, safeName), fileBuffer);
    this.logger.log(`[KB] Saved PDF for user ${userId}: ${safeName}`);

    // 2. Get page count via pdf-parse (no AI call needed)
    let pages = 1;
    try {
      const data = await parsePdf(fileBuffer);
      if (data.numpages > 0) pages = data.numpages;
    } catch (e) {
      this.logger.warn('[KB] Could not determine page count', e);
    }

    // 3. Track metadata
    const existing = this.getOrLoad(userId) ?? { userId, files: [] };
    existing.files.push({ name: originalName, storedAs: safeName, pages, uploadedAt: new Date().toISOString().slice(0, 10) });
    this.knowledgeByUser.set(userId, existing);
    this.saveIndex(existing);

    this.logger.log(`[KB] Indexed PDF for user ${userId} — ${pages} page(s)`);
    return { chunks: pages, storedAs: safeName };
  }

  // ── Answer question using inline PDF (Claude) ─────────────────────────────

  async answerQuestionForUser(
    userId: number,
    question: string,
  ): Promise<{ answer: string; usedChunks: string[] }> {
    const userKB = this.getOrLoad(userId);

    if (!userKB || userKB.files.length === 0) {
      throw new BadRequestException('No knowledge base found for this user. Please upload a PDF first.');
    }

    const userDir = join(process.cwd(), 'uploads', String(userId));

    // Build content: one document block per PDF + the question
    const contentBlocks: Anthropic.MessageParam['content'] = [];

    for (const file of userKB.files) {
      const filePath = join(userDir, file.storedAs);
      if (!existsSync(filePath)) {
        this.logger.warn(`[KB] PDF missing on disk: ${filePath}`);
        continue;
      }
      const base64 = readFileSync(filePath).toString('base64');
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      } as Anthropic.Base64PDFSource & { type: 'document' });
    }

    if (contentBlocks.length === 0) {
      throw new BadRequestException('PDF files were not found on disk. Please re-upload.');
    }

    contentBlocks.push({ type: 'text', text: question });

    const response = await this.getClient().messages.create({
      model:      this.getModelName(),
      max_tokens: CLAUDE_DEFAULTS.maxTokens,
      system:     RAG_SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: contentBlocks }],
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    this.logger.log(`[KB] Answered question for user ${userId} using ${contentBlocks.length - 1} PDF(s)`);

    return { answer, usedChunks: [] };
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  getFilesForUser(userId: number): IndexedFile[] {
    return this.getOrLoad(userId)?.files.map((f) => ({
      name:      f.name,
      chunks:    f.pages,
      uploadedAt: f.uploadedAt,
    })) ?? [];
  }

  clearUserKnowledge(userId: number): void {
    this.knowledgeByUser.delete(userId);
    const path = this.indexPath(userId);
    if (existsSync(path)) {
      try {
        const { unlinkSync } = require('fs') as typeof import('fs');
        unlinkSync(path);
      } catch { /* ignore */ }
    }
    this.logger.log(`[KB] Cleared knowledge base for user ${userId}`);
  }
}
