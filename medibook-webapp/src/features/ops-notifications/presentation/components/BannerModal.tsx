import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { OpsField } from '@/shared/ui/OpsField';
import { TextInput } from '@/shared/ui/TextInput';

import type { BannerDraft } from '@/features/ops-notifications/application/store/notifications.store';
import type { Banner } from '@/features/ops-notifications/application/store/notifications.types';

interface BannerModalProps {
  open: boolean;
  /** The campaign banner being edited, or null for a new / default-banner edit. */
  banner: Banner | null;
  /** True when editing the always-on default banner (no schedule fields). */
  fallback: boolean;
  onClose: () => void;
  onSave: (f: BannerDraft) => void;
}

interface BannerErrors {
  title?: string | null;
  from?: string | null;
  to?: string | null;
}

const EMPTY_DRAFT: BannerDraft = { title: '', img: null, from: '', to: '' };

const dateInputClass =
  'text-body text-text-body rounded-input border-border h-12 w-full border bg-white px-3';

/** Add / edit a campaign banner, or edit the default banner (image upload + schedule). */
export function BannerModal({ open, banner, fallback, onClose, onSave }: BannerModalProps) {
  const [f, setF] = useState<BannerDraft>(EMPTY_DRAFT);
  const [err, setErr] = useState<BannerErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setF(
        banner
          ? { title: banner.title, img: banner.img, from: banner.from || '', to: banner.to || '' }
          : EMPTY_DRAFT,
      );
      setErr({});
    }
  }, [open, banner]);

  const pickFile = () => fileRef.current?.click();

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      if (typeof rd.result === 'string') {
        const img = rd.result;
        setF((p) => ({ ...p, img }));
      }
    };
    rd.readAsDataURL(file);
    e.target.value = '';
  };

  const submit = () => {
    const e: BannerErrors = {
      title: f.title.trim() ? null : 'Give the banner a title.',
      from: fallback || f.from ? null : 'Set a start date.',
      to: fallback || (f.to && f.to >= f.from) ? null : 'Set an end date on or after the start.',
    };
    setErr(e);
    if (e.title || e.from || e.to) return;
    onSave(f);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fallback ? 'Edit Default Banner' : banner ? 'Edit Banner' : 'Add Banner'}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={submit}>
            {banner || fallback ? 'Save Banner' : 'Add Banner'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {fallback && (
          <div className="text-caption text-text-muted bg-blue-soft-bg flex items-start gap-2 rounded-sm px-3 py-2.5">
            <Icon name="info" size={14} className="mt-px flex-none" /> The default banner has no
            schedule — the app shows it whenever no campaign banner is live.
          </div>
        )}
        <OpsField label="Banner Title" required error={err.title}>
          <TextInput
            value={f.title}
            onChange={(v) => {
              setF({ ...f, title: v });
              setErr({ ...err, title: null });
            }}
            placeholder="e.g. Monsoon Health Camp — 20% off"
            height={48}
          />
        </OpsField>
        <OpsField label="Banner Image">
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          {f.img ? (
            <div className="flex flex-col gap-2">
              <img
                src={f.img}
                alt="Banner preview"
                className="border-border-soft h-37.5 w-full rounded-md border object-cover"
              />
              <div className="flex gap-3.5">
                <button
                  type="button"
                  onClick={pickFile}
                  className="text-caption text-blue cursor-pointer"
                >
                  Replace image
                </button>
                <button
                  type="button"
                  onClick={() => setF({ ...f, img: null })}
                  className="text-caption text-d-500 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={pickFile}
              className="border-border text-text-muted bg-bg-subtle flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-md border-[1.5px] border-dashed px-3 py-5.5"
            >
              <Icon name="upload" size={20} />
              <span className="text-body">Click to upload an image</span>
              <span className="text-caption text-text-faint">
                PNG or JPG · 1200×600 (2:1) recommended · title shows as overlay text if no image
              </span>
            </button>
          )}
        </OpsField>
        {!fallback && (
          <div className="grid grid-cols-2 gap-4">
            <OpsField label="Live From" required error={err.from}>
              <input
                type="date"
                value={f.from}
                onChange={(e) => {
                  setF({ ...f, from: e.target.value });
                  setErr({ ...err, from: null });
                }}
                className={dateInputClass}
              />
            </OpsField>
            <OpsField label="Live Until" required error={err.to}>
              <input
                type="date"
                value={f.to}
                onChange={(e) => {
                  setF({ ...f, to: e.target.value });
                  setErr({ ...err, to: null });
                }}
                className={dateInputClass}
              />
            </OpsField>
          </div>
        )}
      </div>
    </Modal>
  );
}
