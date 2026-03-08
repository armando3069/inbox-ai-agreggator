import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-page)]">
      <div className="text-center">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
          <MessageSquare className="w-10 h-10 text-[var(--border-default)]" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1.5">Selectează o conversație</h3>
        <p className="text-[13px] text-[var(--text-tertiary)] max-w-xs mx-auto leading-relaxed">
          Alege o conversație din listă pentru a vizualiza mesajele și a beneficia de funcțiile
          inteligente
        </p>
      </div>
    </div>
  );
}
