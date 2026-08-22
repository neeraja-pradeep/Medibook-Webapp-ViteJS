import { Card } from '@/shared/ui/Card';
import { SectionTitle } from '@/shared/ui/SectionTitle';

/** [department, share %] — the design's department split. */
const DEPTS: readonly (readonly [string, number])[] = [
  ['Cardiology', 24],
  ['General Medicine', 19],
  ['Orthopaedics', 16],
  ['Paediatrics', 12],
  ['Gynaecology', 9],
  ['ENT', 7],
  ['Others', 13],
];

/** Progress bars are scaled to the largest share (design divides by 24). */
const DEPT_MAX = 24;

/** "Department Split" — labelled progress bars per department. */
export function DepartmentSplitCard() {
  return (
    <Card>
      <SectionTitle className="mb-4.5">Department Split</SectionTitle>
      <div className="flex flex-col gap-3.5">
        {DEPTS.map(([name, pct]) => (
          <div key={name} className="flex flex-col gap-1.25">
            <div className="flex justify-between">
              <span className="text-body text-text-body">{name}</span>
              <span className="text-body text-text-strong font-medium tabular-nums">{pct}%</span>
            </div>
            <div className="bg-grey-300 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-blue h-full rounded-full"
                style={{ width: `${(pct / DEPT_MAX) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
