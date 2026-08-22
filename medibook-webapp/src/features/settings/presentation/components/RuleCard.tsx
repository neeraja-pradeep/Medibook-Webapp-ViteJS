import type { ReactNode } from 'react';

import { Card } from '@/shared/ui/Card';

interface RuleCardProps {
  title: string;
  hint?: string;
  children?: ReactNode;
}

/** Centered-title card that groups a set of `RuleRow`s (design `RuleCard`). */
export function RuleCard({ title, hint, children }: RuleCardProps) {
  return (
    <Card>
      <div className="mb-1.5 text-center">
        <div className="text-h3 text-text-navy">{title}</div>
        {hint && <div className="text-caption text-text-muted">{hint}</div>}
      </div>
      <div className="bg-border-soft my-2 h-px"></div>
      {children}
    </Card>
  );
}
