"use client";

import { useState } from "react";
import { Button } from "./button";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Баталгаажуулах",
  onConfirm,
  trigger,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-base font-semibold">{title}</h3>
            {description && <p className="mt-2 text-sm text-[#6B7280]">{description}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Болих
              </Button>
              <Button
                onClick={async () => {
                  await onConfirm();
                  setOpen(false);
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
