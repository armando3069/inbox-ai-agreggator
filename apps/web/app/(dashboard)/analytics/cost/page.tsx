"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyticsService, analyticsQueryKeys } from "@/services/analytics/analytics.service";
import { PageHeader } from "@/components/layout/PageHeader";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
      <p className="text-[12px] text-[var(--text-tertiary)] font-medium mb-2">{label}</p>
      <p className="text-[28px] font-semibold text-[var(--text-primary)] leading-none">{value}</p>
      {sub && <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">{sub}</p>}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtUsd(n: number) {
  return `$${n.toFixed(4)}`;
}

function fmtUsdAxis(n: number) {
  return `$${n.toFixed(3)}`;
}

export default function CostPage() {
  const { data, isLoading } = useQuery({
    ...analyticsQueryKeys.cost(30),
    queryFn: () => analyticsService.getCost(30),
    staleTime: 60_000,
  });

  const chartData = (data?.daily ?? []).map((d) => ({
    date: formatDate(d.date),
    "Cost (USD)": d.cost_usd,
  }));

  const total = data?.total_cost_usd ?? 0;

  // Simulated web-search cost & code execution cost are always 0 for local Ollama
  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-default)]">
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <PageHeader title="Cost" />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total token cost"
          value={isLoading ? "—" : `USD ${total.toFixed(6)}`}
          sub="Claude 3.5 Haiku pricing"
        />
        <StatCard
          label="Input token cost"
          value="$0.80 / 1M"
          sub="Per 1M input tokens"
        />
        <StatCard
          label="Output token cost"
          value="$4.00 / 1M"
          sub="Per 1M output tokens"
        />
      </div>

      {/* Chart */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6">
        <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Daily token cost</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mb-6">Claude 3.5 Haiku — USD cost per day, last 30 days</p>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-[13px]">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-[22px] font-light">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent-primary)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmtUsdAxis}
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(v: unknown) => [fmtUsd(Number(v ?? 0)), "Cost"]}
                contentStyle={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="Cost (USD)"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="url(#costGradient)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
    </div>
  );
}
