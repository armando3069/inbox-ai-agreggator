"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
  SlidersHorizontal,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Check,
  Globe,
} from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { contactsQueryKeys } from "@/services/contacts/contacts.service";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { LIFECYCLE_STAGES, getLifecycleStage } from "@/lib/lifecycle";
import { AvatarWithPlatformBadge } from "@/components/chat/AvatarWithPlatformBadge";
import { cn } from "@/lib/cn";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const PLATFORM_OPTIONS = [
  { value: "", label: "All Platforms" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "teams", label: "Teams" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function displayName(row: ContactRow): string {
  return row.contact_name || row.contact_username || `Chat #${row.id}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Platform badge ───────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    telegram: "bg-sky-50 text-sky-600 border-sky-100",
    whatsapp: "bg-emerald-50 text-emerald-600 border-emerald-100",
    teams: "bg-violet-50 text-violet-600 border-violet-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium capitalize",
        styles[platform] || "bg-stone-50 text-stone-500 border-stone-200"
      )}
    >
      {platform}
    </span>
  );
}

// ── Premium checkbox ─────────────────────────────────────────────────────────

function PremiumCheckbox({
  checked,
  onCheckedChange,
  indeterminate,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  indeterminate?: boolean;
}) {
  return (
    <Checkbox.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border transition-all",
        checked || indeterminate
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
          : "border-[var(--border-default)] bg-white hover:border-[var(--text-tertiary)]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox.Indicator>
        {indeterminate ? (
          <div className="h-0.5 w-2 rounded-full bg-white" />
        ) : (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

// ── Toolbar filter dropdown ──────────────────────────────────────────────────

function ToolbarDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none px-3 py-2 text-[13px] border border-[var(--border-default)] rounded-[var(--radius-input)] bg-white text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]/30 cursor-pointer pr-8"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [platform, lifecycle]);

  const filters = {
    platform: platform || undefined,
    lifecycle: lifecycle || undefined,
    search: debouncedSearch || undefined,
  };

  const {
    data: contacts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery(contactsQueryKeys.list(filters));

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
  const paginatedContacts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return contacts.slice(start, start + PAGE_SIZE);
  }, [contacts, page]);

  // Selection helpers
  const allOnPageSelected =
    paginatedContacts.length > 0 &&
    paginatedContacts.every((c) => selectedIds.has(c.id));
  const someOnPageSelected =
    paginatedContacts.some((c) => selectedIds.has(c.id)) && !allOnPageSelected;

  function toggleAll() {
    if (allOnPageSelected) {
      const next = new Set(selectedIds);
      paginatedContacts.forEach((c) => next.delete(c.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      paginatedContacts.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
  }

  function toggleOne(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  const handleRowClick = (row: ContactRow) => {
    sessionStorage.setItem("pendingConvId", String(row.id));
    router.push("/");
  };

  const lifecycleOptions = [
    { value: "", label: "All Stages" },
    ...LIFECYCLE_STAGES.map((s) => ({ value: s.value, label: `${s.emoji} ${s.label}` })),
  ];

  const hasActiveFilters = platform || lifecycle;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                Contacts
              </h1>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                {isLoading
                  ? "Loading..."
                  : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <span className="text-[12px] text-[var(--text-secondary)] mr-1">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                onClick={() => setSelectedIds(new Set())}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium rounded-[var(--radius-button)] border border-[var(--border-default)] text-[var(--text-secondary)] bg-white transition-colors hover:bg-[var(--bg-surface-hover)]",
                  selectedIds.size === 0 && "opacity-50 pointer-events-none"
                )}
              >
                Actions
              </button>
              <button className="px-4 py-2 text-[13px] font-medium rounded-[var(--radius-button)] bg-[var(--accent-primary)] text-white transition-colors hover:bg-[#222] shadow-sm">
                New contact
              </button>
            </div>
          </div>

          {/* ── Main card ──────────────────────────────────────────────── */}
          <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-white shadow-[var(--shadow-card)] overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)]">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-[var(--border-default)] rounded-[var(--radius-input)] bg-[var(--bg-surface-hover)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]/30 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex-1" />

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-[var(--radius-input)] border transition-colors",
                  showFilters || hasActiveFilters
                    ? "border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 text-[var(--text-primary)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[10px] font-bold text-white">
                    {(platform ? 1 : 0) + (lifecycle ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* View settings (decorative for now) */}
              <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-[var(--radius-input)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                <LayoutGrid className="w-3.5 h-3.5" />
                View
              </button>
            </div>

            {/* Filter bar (collapsible) */}
            {showFilters && (
              <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]/50">
                <ToolbarDropdown value={platform} onChange={setPlatform} options={PLATFORM_OPTIONS} />
                <ToolbarDropdown value={lifecycle} onChange={setLifecycle} options={lifecycleOptions} />
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setPlatform("");
                      setLifecycle("");
                    }}
                    className="text-[12px] text-[var(--accent-blue)] hover:underline ml-1"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* ── Table ──────────────────────────────────────────────── */}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-[var(--text-tertiary)]">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading contacts...
              </div>
            ) : isError ? (
              <div className="py-20 text-center">
                <p className="text-[13px] text-red-500 mb-2">
                  Failed to load contacts.
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-[13px] text-[var(--accent-blue)] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[var(--bg-surface-hover)] flex items-center justify-center">
                  <Users className="h-6 w-6 text-[var(--text-tertiary)]" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--text-secondary)]">
                    No contacts found
                  </p>
                  <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                    {search || platform || lifecycle
                      ? "Try adjusting your filters."
                      : "Start a conversation to see contacts here."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="w-12 px-4 py-3">
                        <PremiumCheckbox
                          checked={allOnPageSelected}
                          indeterminate={someOnPageSelected}
                          onCheckedChange={toggleAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Platform
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Stage
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedContacts.map((row) => {
                      const stage = getLifecycleStage(row.lifecycle_status);
                      const isSelected = selectedIds.has(row.id);
                      return (
                        <tr
                          key={row.id}
                          onClick={() => handleRowClick(row)}
                          className={cn(
                            "border-b border-[var(--border-subtle)] cursor-pointer transition-colors group",
                            isSelected
                              ? "bg-[var(--accent-primary)]/[0.02]"
                              : "hover:bg-[var(--bg-surface-hover)]"
                          )}
                        >
                          {/* Checkbox */}
                          <td className="w-12 px-4 py-3.5">
                            <PremiumCheckbox
                              checked={isSelected}
                              onCheckedChange={() => toggleOne(row.id)}
                            />
                          </td>

                          {/* Name + Avatar */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <AvatarWithPlatformBadge
                                name={displayName(row)}
                                avatar={row.contact_avatar}
                                platform={row.platform}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">
                                  {displayName(row)}
                                </p>
                                {row.contact_username && row.contact_name && (
                                  <p className="text-[11px] text-[var(--text-tertiary)] truncate max-w-[180px]">
                                    @{row.contact_username}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Platform */}
                          <td className="px-4 py-3.5">
                            <PlatformBadge platform={row.platform} />
                          </td>

                          {/* Stage */}
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium",
                                stage.badgeClass
                              )}
                            >
                              <span className="text-[10px]">{stage.emoji}</span>
                              <span>{stage.label}</span>
                            </span>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                            {row.contact_email ? (
                              <div className="flex items-center gap-1.5 max-w-[180px]">
                                <Mail className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
                                <span className="truncate">{row.contact_email}</span>
                              </div>
                            ) : (
                              <span className="text-[var(--border-default)]">--</span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                            {row.contact_phone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
                                <span>{row.contact_phone}</span>
                              </div>
                            ) : (
                              <span className="text-[var(--border-default)]">--</span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                            {row.contact_country ? (
                              <div className="flex items-center gap-1.5">
                                <Globe className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
                                <span>{row.contact_country}</span>
                                {row.contact_language && (
                                  <span className="text-[11px] text-[var(--text-tertiary)] uppercase">
                                    ({row.contact_language})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[var(--border-default)]">--</span>
                            )}
                          </td>

                          {/* Added date */}
                          <td className="px-4 py-3.5 text-[12px] text-[var(--text-tertiary)] whitespace-nowrap">
                            {formatDate(row.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination footer ──────────────────────────────────── */}
            {!isLoading && !isError && contacts.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)]">
                <p className="text-[12px] text-[var(--text-tertiary)]">
                  Showing{" "}
                  <span className="font-medium text-[var(--text-secondary)]">
                    {Math.min((page - 1) * PAGE_SIZE + 1, contacts.length)}
                  </span>
                  {" - "}
                  <span className="font-medium text-[var(--text-secondary)]">
                    {Math.min(page * PAGE_SIZE, contacts.length)}
                  </span>
                  {" of "}
                  <span className="font-medium text-[var(--text-secondary)]">
                    {contacts.length}
                  </span>
                  {" contacts"}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center justify-center h-8 w-8 rounded-[var(--radius-badge)] border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-[var(--radius-badge)] text-[12px] font-medium transition-colors",
                          page === pageNum
                            ? "bg-[var(--accent-primary)] text-white"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center justify-center h-8 w-8 rounded-[var(--radius-badge)] border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
