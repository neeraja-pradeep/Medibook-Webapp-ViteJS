import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { toast } from '@/shared/ui/toast/toast.store';

interface ImageUploadProps {
  label?: string;
  hint?: string;
  /** Placeholder width — px number or CSS size (design default "100%"; dynamic, hence style). */
  w?: number | string;
  /** Placeholder height — px number or CSS size (design default 120; dynamic, hence style). */
  h?: number | string;
  icon?: IconName;
}

/** Dashed image-upload placeholder (admin fills with real imagery later). */
export function ImageUpload({
  label = 'Upload image',
  hint,
  w = '100%',
  h = 120,
  icon = 'image-plus',
}: ImageUploadProps) {
  return (
    <button
      type="button"
      onClick={() => toast('Image upload — demo', 'info')}
      className="border-border bg-bg-subtle text-text-muted hover:border-blue hover:bg-blue-soft-bg flex cursor-pointer flex-col items-center justify-center gap-1.75 rounded-lg border-[1.5px] border-dashed transition-all duration-150"
      style={{ width: w, height: h }}
    >
      <Icon name={icon} size={24} />
      <span className="text-body font-medium">{label}</span>
      {hint && <span className="text-caption text-text-faint">{hint}</span>}
    </button>
  );
}
