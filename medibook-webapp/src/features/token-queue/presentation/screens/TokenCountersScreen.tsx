import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { RefreshBtn } from '@/shared/ui/RefreshBtn';

import { useAppointmentsStore } from '@/features/appointments/application/store/appointments.store';
import {
  DEPARTMENTS,
  DOCTOR_META,
} from '@/features/appointments/application/store/appointments.types';
import { DoctorQueueCard } from '@/features/token-queue/presentation/components/DoctorQueueCard';

/**
 * Live token queue (design `Screens.jsx` `TokenCounters`): a doctor-centric
 * department front desk — search + department/doctor filters + refresh, a
 * Serving / Waiting / On break / Longest stat strip (Longest turns danger red
 * past 20 min), and a two-column grid of `DoctorQueueCard`s. A 30-second tick
 * keeps every card's elapsed timer live.
 */
export function TokenCountersScreen() {
  const appts = useAppointmentsStore((s) => s.appts);
  const serving = useAppointmentsStore((s) => s.serving);
  const docStatus = useAppointmentsStore((s) => s.docStatus);
  const activeDept = useAppointmentsStore((s) => s.activeDept);
  const setDept = useAppointmentsStore((s) => s.setDept);
  const queueForDoctor = useAppointmentsStore((s) => s.queueForDoctor);

  const [q, setQ] = useState('');
  const [docF, setDocF] = useState('All Doctors');
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const dept = activeDept || 'All Departments';
  const inDept = Object.keys(DOCTOR_META).filter(
    (d) => dept === 'All Departments' || DOCTOR_META[d].dept === dept,
  );
  const ql = q.trim().toLowerCase();
  const doctors = inDept.filter((d) => {
    if (docF !== 'All Doctors' && d !== docF) return false;
    if (ql && !d.toLowerCase().includes(ql)) return false;
    return true;
  });

  const servingCount = doctors.filter((d) => serving[d]).length;
  const waitingCount = doctors.reduce((n, d) => n + queueForDoctor(d).length, 0);
  const breakCount = doctors.filter((d) => docStatus[d] === 'On Break').length;
  const longest = doctors.reduce((mx, d) => {
    const a = appts.find((x) => x.token === serving[d] && x.doctor === d);
    if (a && a.calledAt) return Math.max(mx, Math.round((Date.now() - a.calledAt) / 60000));
    return mx;
  }, 0);

  const stats: readonly { label: string; val: number | string; color: string }[] = [
    { label: 'Serving', val: servingCount, color: 'text-blue' },
    { label: 'Waiting', val: waitingCount, color: 'text-text-strong' },
    { label: 'On break', val: breakCount, color: 'text-text-muted' },
    {
      label: 'Longest',
      val: longest ? `${longest}m` : '—',
      color: longest > 20 ? 'text-d-500' : 'text-g-600',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card pad={14} className="flex flex-wrap items-center gap-3.5">
        <div className="border-border text-text-muted flex h-10.5 min-w-55 flex-1 items-center gap-3 rounded-lg border px-3.5">
          <Icon name="search" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by doctor"
            className="text-body text-text-strong flex-1 border-none bg-transparent outline-none"
          />
        </div>
        <FilterSelect
          value={dept}
          options={['All Departments', ...DEPARTMENTS]}
          onChange={(v) => {
            setDept(v);
            setDocF('All Doctors');
          }}
        />
        <FilterSelect value={docF} options={['All Doctors', ...inDept]} onChange={setDocF} />
        <RefreshBtn />
        <div className="bg-border h-8.5 w-px" />
        <div className="flex items-center gap-5 pr-1">
          {stats.map((st) => (
            <div key={st.label} className="flex min-w-13 flex-col gap-px text-center">
              <span className={cn('text-[22px] font-bold tabular-nums', st.color)}>{st.val}</span>
              <span className="text-caption text-text-muted">{st.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3.5">
        {doctors.map((d) => (
          <DoctorQueueCard key={d} doctor={d} />
        ))}
      </div>

      {doctors.length === 0 && (
        <Card pad={40} className="text-body-lg text-text-faint text-center">
          No doctors match your search.
        </Card>
      )}
    </div>
  );
}
