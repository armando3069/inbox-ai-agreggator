"use client";

import { CheckCircle2, Loader2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useContactsState } from "./hooks/useContactsState";
import { useContactsActions } from "./hooks/useContactsActions";
import { ContactsHeader } from "./components/ContactsHeader";
import { ContactsToolbar } from "./components/ContactsToolbar";
import { ContactsTable } from "./components/ContactsTable";
import { DeleteContactsModal } from "./components/DeleteContactsModal";

export default function ContactsPage() {
  const state   = useContactsState();
  const actions = useContactsActions(state);

  const {
    search, setSearch,
    page, setPage, totalPages,
    selectedIds,
    sortDir, setSortDir,
    platformFilter,
    exportToast,
    deleteConfirmOpen, setDeleteConfirmOpen,
    isDeleting,
    editingId,
    editDraft, setEditDraft,
    isSaving,
    sorted,
    paginated,
    allOnPage,
    someOnPage,
    isLoading,
    isError,
    refetch,
  } = state;

  const {
    handleExportAll,
    handleExportSelected,
    handleDeleteSelected,
    startEditing,
    cancelEditing,
    saveEditing,
    toggleAll,
    toggleOne,
    togglePlatform,
    clearPlatformFilter,
    handleRowClick,
  } = actions;

  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-default)]">

      {/* Export / action toast */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700 shadow-[var(--shadow-dropdown)] dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {exportToast}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteContactsModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        selectedCount={selectedIds.size}
        isDeleting={isDeleting}
        onConfirm={handleDeleteSelected}
      />

      {/* Header */}
      <ContactsHeader
        selectedCount={selectedIds.size}
        sortedCount={sorted.length}
        onStartEditing={startEditing}
        onExportAll={handleExportAll}
        onExportSelected={handleExportSelected}
        onOpenDeleteConfirm={() => setDeleteConfirmOpen(true)}
      />

      {/* Search toolbar + filters */}
      <ContactsToolbar
        search={search}
        onSearchChange={setSearch}
        platformFilter={platformFilter}
        onTogglePlatform={togglePlatform}
        onClearFilter={clearPlatformFilter}
      />

      {/* Table area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2.5 flex-1 text-[13px] text-[var(--text-tertiary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading contacts...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <p className="text-[13px] text-red-500">Failed to load contacts.</p>
            <button
              onClick={() => refetch()}
              className="text-[13px] text-[var(--accent-blue)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-16">
            <div className="h-11 w-11 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center">
              <Users className="h-5 w-5 text-[var(--text-tertiary)]" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[var(--text-secondary)]">No contacts found</p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                {search ? "Try adjusting your search." : "No contacts in this category."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <ContactsTable
              paginated={paginated}
              allOnPage={allOnPage}
              someOnPage={someOnPage}
              sortDir={sortDir}
              onToggleAll={toggleAll}
              onSort={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
              editingId={editingId}
              editDraft={editDraft}
              isSaving={isSaving}
              selectedIds={selectedIds}
              onToggleOne={toggleOne}
              onEditDraftChange={setEditDraft}
              onSaveEditing={saveEditing}
              onCancelEditing={cancelEditing}
              onRowClick={handleRowClick}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-subtle)]">
              <p className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
                {sorted.length} record{sorted.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-120 ease-out"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[12px] text-[var(--text-secondary)] px-2 tabular-nums min-w-[40px] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-120 ease-out"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
