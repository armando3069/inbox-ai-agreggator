import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import { createQueryKeys } from "@lukemorales/query-key-factory";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DailyTokenUsage {
  date: string;
  tokens_in: number;
  tokens_out: number;
  total: number;
}

export interface TokenUsageResponse {
  totals: { tokens_in: number; tokens_out: number; total: number };
  daily: DailyTokenUsage[];
}

export interface DailyCost {
  date: string;
  cost_usd: number;
}

export interface CostResponse {
  total_cost_usd: number;
  daily: DailyCost[];
}

export interface DailyMessageCount {
  date: string;
  incoming: number;
  outgoing: number;
  total: number;
}

export interface MessagesResponse {
  totals: { incoming: number; outgoing: number; total: number };
  this_month: { incoming: number; outgoing: number; total: number };
  daily: DailyMessageCount[];
}

// ── Service ────────────────────────────────────────────────────────────────────

class AnalyticsService {
  getTokenUsage(days = 30): Promise<TokenUsageResponse> {
    return request.get<TokenUsageResponse>(`${ROUTES.analytics.tokens}?days=${days}`);
  }

  getCost(days = 30): Promise<CostResponse> {
    return request.get<CostResponse>(`${ROUTES.analytics.cost}?days=${days}`);
  }

  getMessageStats(days = 30): Promise<MessagesResponse> {
    return request.get<MessagesResponse>(`${ROUTES.analytics.messages}?days=${days}`);
  }
}

export const analyticsService = new AnalyticsService();

// ── Query keys ─────────────────────────────────────────────────────────────────

export const analyticsQueryKeys = createQueryKeys("analytics", {
  tokens:   (days: number) => ({ queryKey: ["analytics", "tokens",   days] }),
  cost:     (days: number) => ({ queryKey: ["analytics", "cost",     days] }),
  messages: (days: number) => ({ queryKey: ["analytics", "messages", days] }),
});
