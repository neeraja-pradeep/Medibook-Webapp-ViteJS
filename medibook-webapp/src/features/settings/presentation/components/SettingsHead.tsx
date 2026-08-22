import type { ReactNode } from 'react';

import { InfoDot } from '@/shared/ui/InfoDot';
import { SectionTitle } from '@/shared/ui/SectionTitle';

interface SettingsHeadProps {
  children?: ReactNode;
  /** Optional tooltip explaining the section's mobile-app impact. */
  info?: string;
}

/** Section heading with an optional trailing info dot (design `SettingsHead`). */
export function SettingsHead({ children, info }: SettingsHeadProps) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <SectionTitle>{children}</SectionTitle>
      {info && <InfoDot text={info} />}
    </div>
  );
}
