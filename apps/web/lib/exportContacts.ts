import * as XLSX from "xlsx";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { getLifecycleStage } from "@/lib/lifecycle";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * Generates and downloads an .xlsx file from the given contact rows.
 *
 * @param contacts   Array of ContactRow to export (already filtered/sorted).
 * @param viewLabel  Optional label used to suffix the filename (e.g. "new_leads").
 */
export function exportContactsToXlsx(
  contacts: ContactRow[],
  viewLabel?: string
): void {
  const HEADERS = [
    "Name",
    "Username",
    "Platform",
    "Lifecycle",
    "Email",
    "Phone",
    "Country",
    "Language",
    "Added",
  ];

  const rows = contacts.map((c) => [
    c.contact_name || c.contact_username || `Chat #${c.id}`,
    c.contact_username ? `@${c.contact_username}` : "",
    capitalize(c.platform),
    c.lifecycle_status ? getLifecycleStage(c.lifecycle_status).label : "",
    c.contact_email   ?? "",
    c.contact_phone   ?? "",
    c.contact_country  ?? "",
    c.contact_language ?? "",
    fmtDate(c.created_at),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);

  // Column widths
  ws["!cols"] = [
    { wch: 28 }, // Name
    { wch: 20 }, // Username
    { wch: 14 }, // Platform
    { wch: 14 }, // Lifecycle
    { wch: 30 }, // Email
    { wch: 16 }, // Phone
    { wch: 14 }, // Country
    { wch: 12 }, // Language
    { wch: 16 }, // Added
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");

  const date   = new Date().toISOString().split("T")[0];
  const suffix = viewLabel && viewLabel !== "all" ? `-${viewLabel}` : "";
  XLSX.writeFile(wb, `contacts-export${suffix}-${date}.xlsx`);
}
