"use client";

import { useRef, useState, useEffect } from "react";
import { Star, Archive, ChevronDown, Pencil, X, Check } from "lucide-react";
import type { ConversationViewModel } from "@/lib/types";
import type { ContactInfoPatch } from "@/services/api/api";
import { LIFECYCLE_STAGES, getLifecycleStage } from "@/lib/lifecycle";
import { PlatformIcon } from "./PlatformIcon";
import { AvatarWithPlatformBadge } from "./AvatarWithPlatformBadge";

interface ChatHeaderProps {
  conversation: ConversationViewModel;
  onUpdateConversation: (id: number, patch: ContactInfoPatch) => Promise<void>;
}

// ── Lifecycle Dropdown ────────────────────────────────────────────────────────

function LifecycleDropdown({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const stage = getLifecycleStage(current);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const activeStages = LIFECYCLE_STAGES.filter((s) => s.group === "active");
  const lostStages   = LIFECYCLE_STAGES.filter((s) => s.group === "lost");

  const handleSelect = (value: string) => {
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div ref={ref} className="relative">
      {/* Badge / trigger */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[14px] font-medium transition-all ${stage.badgeClass} hover:opacity-80`}
      >
        <span>{stage.emoji}</span>
        <span>{stage.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Lifecycle Stages
            </p>
          </div>
          {activeStages.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                s.value === current
                  ? "bg-slate-50 font-medium text-slate-800"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{s.emoji}</span>
              <span className="flex-1 text-left">{s.label}</span>
              {s.value === current && <Check className="w-3 h-3 text-slate-400" />}
            </button>
          ))}

          <div className="border-t border-slate-100 my-1" />
          <div className="px-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Lost Stages
            </p>
          </div>
          {lostStages.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                s.value === current
                  ? "bg-slate-50 font-medium text-slate-800"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{s.emoji}</span>
              <span className="flex-1 text-left">{s.label}</span>
              {s.value === current && <Check className="w-3 h-3 text-slate-400" />}
            </button>
          ))}
          <div className="h-1" />
        </div>
      )}
    </div>
  );
}

// ── Edit Contact Info Modal ───────────────────────────────────────────────────

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

function EditContactModal({
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

// ── Main export ───────────────────────────────────────────────────────────────

export function ChatHeader({ conversation, onUpdateConversation }: ChatHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleLifecycleChange = (value: string) => {
    void onUpdateConversation(conversation.id, { lifecycleStatus: value });
  };

  const handleContactSave = (patch: ContactInfoPatch) =>
    onUpdateConversation(conversation.id, patch);

  return (
    <>
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          {/* Left — avatar + name + platform */}
          <div className="flex items-center gap-3 min-w-0">
            <AvatarWithPlatformBadge
              name={conversation.contact}
              avatar={conversation.avatar}
              platform={conversation.platform}
              size="md"
            />
            <div className="w-full">
              <h3 className="font-semibold text-slate-800 truncate">{conversation.contact}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <LifecycleDropdown
                    current={conversation.lifecycleStatus ?? "NEW_LEAD"}
                    onSelect={handleLifecycleChange}
                />
              </div>
            </div>
          </div>

          {/* Right — lifecycle badge + edit contact + star + archive */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit Contact Info"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-slate-500" />
            </button>

            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Star className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Archive className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditContactModal
          conversation={conversation}
          onSave={handleContactSave}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
