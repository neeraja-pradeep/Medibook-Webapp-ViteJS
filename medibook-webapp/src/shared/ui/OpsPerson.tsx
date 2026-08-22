import { Avatar } from '@/shared/ui/Avatar';

export interface OpsPersonRow {
  readonly name: string;
  readonly email: string;
  /** Avatar image URL; falls back to initials when absent. */
  readonly av?: string | null;
}

interface OpsPersonProps {
  row: OpsPersonRow;
}

/** Avatar + name/email column used in ops user tables. */
export function OpsPerson({ row }: OpsPersonProps) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar src={row.av || undefined} name={row.name} size={34} />
      <div className="flex min-w-0 flex-col">
        <span className="text-body text-text-strong font-medium">{row.name}</span>
        <span className="text-caption text-text-muted">{row.email}</span>
      </div>
    </div>
  );
}
