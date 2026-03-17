import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DailyTokenUsage {
  date: string;
  tokens_in: number;
  tokens_out: number;
  total: number;
}

export interface DailyCost {
  date: string;
  cost_usd: number;
}

export interface DailyMessageCount {
  date: string;
  incoming: number;
  outgoing: number;
  total: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Tokens ─────────────────────────────────────────────────────────────────

  async getTokenUsage(userId: number, days = 30): Promise<{
    totals: { tokens_in: number; tokens_out: number; total: number };
    daily: DailyTokenUsage[];
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.prisma.ai_usage_logs.findMany({
      where: {
        user_id: userId,
        created_at: { gte: since },
      },
      select: { tokens_in: true, tokens_out: true, created_at: true },
      orderBy: { created_at: 'asc' },
    });

    // Group by date
    const byDate = new Map<string, { tokens_in: number; tokens_out: number }>();
    let totalIn = 0;
    let totalOut = 0;

    for (const row of rows) {
      const date = row.created_at.toISOString().slice(0, 10);
      const existing = byDate.get(date) ?? { tokens_in: 0, tokens_out: 0 };
      existing.tokens_in  += row.tokens_in;
      existing.tokens_out += row.tokens_out;
      byDate.set(date, existing);
      totalIn  += row.tokens_in;
      totalOut += row.tokens_out;
    }

    const daily: DailyTokenUsage[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        tokens_in:  v.tokens_in,
        tokens_out: v.tokens_out,
        total: v.tokens_in + v.tokens_out,
      }));

    return {
      totals: { tokens_in: totalIn, tokens_out: totalOut, total: totalIn + totalOut },
      daily,
    };
  }

  // ── Cost ───────────────────────────────────────────────────────────────────

  async getCost(userId: number, days = 30): Promise<{
    total_cost_usd: number;
    daily: DailyCost[];
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.prisma.ai_usage_logs.findMany({
      where: {
        user_id: userId,
        created_at: { gte: since },
      },
      select: { cost_usd: true, created_at: true },
      orderBy: { created_at: 'asc' },
    });

    const byDate = new Map<string, number>();
    let totalCost = 0;

    for (const row of rows) {
      const date = row.created_at.toISOString().slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + row.cost_usd);
      totalCost += row.cost_usd;
    }

    const daily: DailyCost[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cost_usd]) => ({ date, cost_usd }));

    return { total_cost_usd: totalCost, daily };
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async getMessageStats(userId: number, days = 30): Promise<{
    totals: { incoming: number; outgoing: number; total: number };
    this_month: { incoming: number; outgoing: number; total: number };
    daily: DailyMessageCount[];
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get all platform_account IDs for this user
    const platformAccounts = await this.prisma.platform_accounts.findMany({
      where: { user_id: userId },
      select: { id: true },
    });
    const accountIds = platformAccounts.map((a) => a.id);

    if (accountIds.length === 0) {
      const empty = { incoming: 0, outgoing: 0, total: 0 };
      return { totals: empty, this_month: empty, daily: [] };
    }

    // Get conversations for those accounts
    const conversations = await this.prisma.conversations.findMany({
      where: { platform_account_id: { in: accountIds } },
      select: { id: true },
    });
    const convIds = conversations.map((c) => c.id);

    if (convIds.length === 0) {
      const empty = { incoming: 0, outgoing: 0, total: 0 };
      return { totals: empty, this_month: empty, daily: [] };
    }

    const messages = await this.prisma.messages.findMany({
      where: {
        conversation_id: { in: convIds },
        created_at: { gte: since },
      },
      select: { sender_type: true, created_at: true },
      orderBy: { created_at: 'asc' },
    });

    // This-month boundaries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const byDate = new Map<string, { incoming: number; outgoing: number }>();
    let totalIn = 0, totalOut = 0, monthIn = 0, monthOut = 0;

    for (const msg of messages) {
      const date = msg.created_at.toISOString().slice(0, 10);
      const existing = byDate.get(date) ?? { incoming: 0, outgoing: 0 };
      if (msg.sender_type === 'client') {
        existing.incoming++;
        totalIn++;
        if (msg.created_at >= monthStart) monthIn++;
      } else {
        existing.outgoing++;
        totalOut++;
        if (msg.created_at >= monthStart) monthOut++;
      }
      byDate.set(date, existing);
    }

    const daily: DailyMessageCount[] = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        incoming: v.incoming,
        outgoing: v.outgoing,
        total: v.incoming + v.outgoing,
      }));

    return {
      totals: { incoming: totalIn, outgoing: totalOut, total: totalIn + totalOut },
      this_month: { incoming: monthIn, outgoing: monthOut, total: monthIn + monthOut },
      daily,
    };
  }
}
