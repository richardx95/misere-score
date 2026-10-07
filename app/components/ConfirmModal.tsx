"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Bevestigen",
  cancelLabel = "Annuleren",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-2xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-lg border-2 border-neutral-900 shadow-xl overflow-hidden p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="py-1.5 px-3 bg-white border border-neutral-300 text-neutral-700 text-xs font-semibold rounded hover:bg-neutral-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-1.5 px-4 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-red-700 shadow-xs"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
