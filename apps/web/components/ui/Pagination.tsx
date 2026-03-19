"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-subtle)]">
      <p className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
        {totalCount} record{totalCount !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-120 ease-out"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[12px] text-[var(--text-secondary)] px-2 tabular-nums min-w-[40px] text-center">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-120 ease-out"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
