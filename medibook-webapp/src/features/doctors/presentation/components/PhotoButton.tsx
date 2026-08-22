import type { ChangeEvent } from 'react';

import { Icon } from '@/shared/ui/Icon';

interface PhotoButtonProps {
  onPick: (dataUrl: string) => void;
  label?: string;
}

/** Read the picked image as a data URL and hand it back (design `pickFile`). */
function readImage(e: ChangeEvent<HTMLInputElement>, cb: (dataUrl: string) => void): void {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') cb(reader.result);
  };
  reader.readAsDataURL(file);
}

/** Upload / change-photo control backed by a hidden file input (design `PhotoButton`). */
export function PhotoButton({ onPick, label = 'Change Photo' }: PhotoButtonProps) {
  return (
    <label className="inline-block">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => readImage(e, onPick)}
      />
      <span className="text-body border-text-navy text-text-navy inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3.5 py-2 font-medium">
        <Icon name="upload" size={16} /> {label}
      </span>
    </label>
  );
}
