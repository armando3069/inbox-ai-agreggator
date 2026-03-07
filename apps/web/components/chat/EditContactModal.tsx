"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ConversationViewModel } from "@/lib/types";
import type { ContactInfoPatch } from "@/services/conversations/conversations.types";

interface ContactFormState {
  email:    string;
  phone:    string;
  country:  string;
  language: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
      />
    </div>
  );
}

export function EditContactModal({
  conversation,
  onSave,
  onClose,
}: {
  conversation: ConversationViewModel;
  onSave: (patch: ContactInfoPatch) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ContactFormState>({
    email:    conversation.contactEmail    ?? "",
    phone:    conversation.contactPhone    ?? "",
    country:  conversation.contactCountry  ?? "",
    language: conversation.contactLanguage ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        contactEmail:    form.email    || null,
        contactPhone:    form.phone    || null,
        contactCountry:  form.country  || null,
        contactLanguage: form.language || null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Edit Contact Info</h2>
            <p className="text-xs text-slate-500 mt-0.5">{conversation.contact}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form fields */}
        <div className="p-5 space-y-4">
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            placeholder="contact@example.com"
            type="email"
          />
          <Field
            label="Telefon"
            value={form.phone}
            onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
            placeholder="+40 712 345 678"
          />
          <Field
            label="Țară"
            value={form.country}
            onChange={(v) => setForm((p) => ({ ...p, country: v }))}
            placeholder="România"
          />
          <Field
            label="Limbă"
            value={form.language}
            onChange={(v) => setForm((p) => ({ ...p, language: v }))}
            placeholder="Română"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isSaving ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}
