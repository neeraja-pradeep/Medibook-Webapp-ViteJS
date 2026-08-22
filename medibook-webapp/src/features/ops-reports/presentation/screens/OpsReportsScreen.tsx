import { OPS_REPORT_DEFS } from '@/features/ops-reports/application/store/opsReports.fixtures';
import { useOpsReportsStore } from '@/features/ops-reports/application/store/opsReports.store';
import { useOpsAct } from '@/shared/hooks/useOpsAct';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { OPS_TINTS } from '@/shared/ui/OpsConfirm';
import { SectionTitle } from '@/shared/ui/SectionTitle';

/** Ops platform reports — a 3×2 grid of downloadable-report cards (design `OpsReports`). */
export function OpsReportsScreen() {
  const [busy, run] = useOpsAct();
  const reportsGen = useOpsReportsStore((s) => s.reportsGen);
  const markGenerated = useOpsReportsStore((s) => s.markGenerated);
  return (
    <div className="grid grid-cols-3 gap-4">
      {OPS_REPORT_DEFS.map((r, i) => {
        const t = OPS_TINTS[r.tint];
        const key = `r${i}`;
        return (
          <Card key={r.name} className="flex flex-col gap-2.5">
            <div className={cn('flex size-10 items-center justify-center rounded-md', t[0], t[1])}>
              <Icon name={r.icon} size={20} />
            </div>
            <SectionTitle size={16}>{r.name}</SectionTitle>
            <span className="text-body text-text-muted">{r.desc}</span>
            <span className="text-caption text-text-faint">Last generated {reportsGen[i]}</span>
            <div className="mt-1.5">
              <Button
                size="sm"
                variant="secondary"
                icon="download"
                onClick={
                  busy[key] ? undefined : () => run(key, `${r.name} ready.`, () => markGenerated(i))
                }
                className={cn(busy[key] && 'opacity-50')}
              >
                {busy[key] ? 'Preparing…' : 'Download CSV'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
