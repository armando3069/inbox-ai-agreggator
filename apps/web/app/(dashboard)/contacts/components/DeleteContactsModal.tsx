import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export interface DeleteContactsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DeleteContactsModal({
  open,
  onOpenChange,
  selectedCount,
  isDeleting,
  onConfirm,
}: DeleteContactsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-dropdown)] p-6 animate-in fade-in-0 zoom-in-95">
          {/* Icon + title */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <Dialog.Title className="text-[16px] font-semibold text-[var(--text-primary)] leading-tight">
              Delete {selectedCount} contact{selectedCount !== 1 ? "s" : ""}?
            </Dialog.Title>
            <Dialog.Description className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">
              This will permanently delete the selected conversation
              {selectedCount !== 1 ? "s" : ""} and all associated messages. This action
              cannot be undone.
            </Dialog.Description>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <button
                disabled={isDeleting}
                className="flex-1 h-10 rounded-[var(--radius-button)] border border-[var(--border-default)] text-[13px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-colors duration-120 disabled:opacity-50"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 h-10 rounded-[var(--radius-button)] bg-red-600 hover:bg-red-700 text-[13px] font-medium text-white transition-colors duration-120 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
