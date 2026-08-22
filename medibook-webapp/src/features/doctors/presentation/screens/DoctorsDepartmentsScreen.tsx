import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { hospitalPath, isHospitalRole } from '@/app/router/paths';
import { useCatalogStore } from '@/features/doctors/application/store/catalog.store';
import type { Dept, Doctor } from '@/features/doctors/application/store/catalog.types';
import { useSort } from '@/shared/hooks/useSort';
import { cn } from '@/shared/lib/cn';
import { money } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { FilterSelect } from '@/shared/ui/FilterSelect';
import { Icon } from '@/shared/ui/Icon';
import { IconBtn } from '@/shared/ui/IconBtn';
import { InfoDot } from '@/shared/ui/InfoDot';
import { SearchField } from '@/shared/ui/SearchField';
import { SegTabs } from '@/shared/ui/SegTabs';
import { TableShell, tdClass } from '@/shared/ui/TableShell';
import { toast } from '@/shared/ui/toast/toast.store';

import { DeptDrawer } from '../components/DeptDrawer';
import { DeptModal } from '../components/DeptModal';

interface ConfirmTarget {
  kind: 'doc' | 'dept';
  item: Doctor | Dept;
}

const DOC_COLUMNS = [
  'Doctor',
  'Department',
  'Fee',
  'Working Hours',
  'Rating',
  'Status',
  'Action',
] as const;

const DOC_SORT_KEYS = {
  Doctor: 'name',
  Department: 'dept',
  Fee: 'fee',
  Rating: 'rating',
  Status: 'status',
} as const;

/** Doctors & Departments catalog list (design `DoctorsDepartments`). */
export function DoctorsDepartmentsScreen() {
  const { role: roleParam } = useParams();
  const navigate = useNavigate();
  const role = isHospitalRole(roleParam) ? roleParam : 'admin';
  const depts = useCatalogStore((s) => s.depts);
  const docs = useCatalogStore((s) => s.docs);
  const catDeleteDoctor = useCatalogStore((s) => s.catDeleteDoctor);
  const catDeleteDept = useCatalogStore((s) => s.catDeleteDept);
  const [tab, setTab] = useState('Doctors');
  const [deptModal, setDeptModal] = useState<{ open: boolean; dept: Dept | null }>({
    open: false,
    dept: null,
  });
  const [deptView, setDeptView] = useState<Dept | null>(null);
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);
  const [q, setQ] = useState('');
  const [deptF, setDeptF] = useState('All Departments');
  const [statusF, setStatusF] = useState('All Status');
  const { sort, onSort, sorted } = useSort<Doctor>();

  const openDoctor = (id: string) => navigate(`${hospitalPath(role, 'doctors')}/${id}`);
  const shownDocs = docs.filter((d) => {
    if (q && !(d.name + d.spec + d.depts.join(' ')).toLowerCase().includes(q.toLowerCase()))
      return false;
    if (deptF !== 'All Departments' && !d.depts.includes(deptF)) return false;
    if (statusF !== 'All Status' && d.status !== statusF) return false;
    return true;
  });
  const orderedDocs = sorted(shownDocs, {
    name: (d) => d.name,
    dept: (d) => d.depts.join(', '),
    fee: (d) => d.fee,
    rating: (d) => d.rating,
    status: (d) => d.status,
  });
  return (
    <div className="flex flex-col gap-5">
      <Card pad={16} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SegTabs tabs={['Doctors', 'Departments']} value={tab} onChange={setTab} />
          <InfoDot text="Doctors and departments you add here become searchable and bookable in the Medibook patient app." />
        </div>
        {tab === 'Doctors' ? (
          <Button icon="plus" onClick={() => openDoctor('new')}>
            Add Doctor
          </Button>
        ) : (
          <Button icon="plus" onClick={() => setDeptModal({ open: true, dept: null })}>
            Add Department
          </Button>
        )}
      </Card>

      {tab === 'Doctors' ? (
        <Card pad={20}>
          <div className="mb-4">
            <SearchField
              value={q}
              onChange={setQ}
              placeholder="Search doctors by name or specialization"
            />
          </div>
          <div className="mb-4.5 flex items-center gap-3">
            <FilterSelect
              value={deptF}
              options={['All Departments', ...depts.map((x) => x.name)]}
              onChange={setDeptF}
            />
            <FilterSelect
              value={statusF}
              options={['All Status', 'Active', 'On Leave', 'Inactive']}
              onChange={setStatusF}
            />
            {(q || deptF !== 'All Departments' || statusF !== 'All Status') && (
              <span
                onClick={() => {
                  setQ('');
                  setDeptF('All Departments');
                  setStatusF('All Status');
                }}
                className="text-body text-blue cursor-pointer whitespace-nowrap"
              >
                Clear all
              </span>
            )}
          </div>
          <TableShell columns={DOC_COLUMNS} sortKeys={DOC_SORT_KEYS} sort={sort} onSort={onSort}>
            {orderedDocs.map((d) => {
              const onDays = d.week.filter((x) => x.on);
              const hrs = onDays.length
                ? `${onDays[0].day}–${onDays[onDays.length - 1].day} · ${onDays[0].from}–${onDays[0].to}`
                : '—';
              return (
                <tr
                  key={d.id}
                  onClick={() => openDoctor(d.id)}
                  className="hover:bg-grey-200 cursor-pointer transition-colors duration-150"
                >
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={d.name} src={d.photo ?? undefined} size={34} />
                      <span className="text-body text-text-strong font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className={tdClass}>{d.depts.join(', ')}</td>
                  <td className={cn(tdClass, 'font-semibold tabular-nums')}>{money(d.fee)}</td>
                  <td className={cn(tdClass, 'text-text-muted')}>{hrs}</td>
                  <td className={tdClass}>
                    <span className="inline-flex items-center gap-1.25">
                      <Icon
                        name="star"
                        size={14}
                        className="text-y-500"
                        style={{ fill: 'var(--color-y-500)' }}
                      />{' '}
                      {d.rating} <span className="text-text-faint text-caption">({d.reviews})</span>
                    </span>
                  </td>
                  <td className={tdClass}>
                    <Badge status={d.status} />
                  </td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <IconBtn
                        name="pencil"
                        box={34}
                        size={15}
                        title="Edit"
                        onClick={() => openDoctor(d.id)}
                      />
                      <IconBtn
                        name="trash-2"
                        box={34}
                        size={15}
                        color="var(--color-d-500)"
                        title="Remove"
                        onClick={() => setConfirm({ kind: 'doc', item: d })}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableShell>
          {shownDocs.length === 0 && (
            <div className="text-text-faint text-body-lg py-10 text-center">
              No doctors match your filters.
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {depts.map((d) => {
            const count = docs.filter((x) => x.depts.includes(d.name)).length;
            return (
              <Card
                key={d.id}
                pad={0}
                hover
                onClick={() => setDeptView(d)}
                className="overflow-hidden"
              >
                <div
                  className="relative flex h-21 items-center justify-center text-white"
                  style={{
                    background: d.image
                      ? 'none'
                      : `linear-gradient(135deg, ${d.color} 0%, color-mix(in srgb, ${d.color} 70%, #000) 100%)`,
                  }}
                >
                  {d.image ? (
                    <img
                      src={d.image}
                      alt={d.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="stethoscope" size={28} />
                  )}
                  <span className="absolute top-2.5 right-2.5">
                    <Badge status={d.status} />
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-h3 text-text-strong">{d.name}</div>
                  <div className="text-caption text-text-muted mt-1 mb-3 min-h-9 leading-[1.5]">
                    {d.about}
                  </div>
                  <div className="text-body text-text-body flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.25">
                      <Icon name="users" size={15} className="text-text-muted" /> {count} doctor
                      {count === 1 ? '' : 's'}
                    </span>
                    <span className="text-text-strong font-semibold tabular-nums">
                      {money(d.fee)}
                    </span>
                  </div>
                  <div className="text-caption text-text-muted mt-2 flex items-center gap-1.25">
                    <Icon name="clock" size={13} /> {d.hours}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DeptModal
        open={deptModal.open}
        dept={deptModal.dept}
        onClose={() => setDeptModal({ open: false, dept: null })}
      />
      <DeptDrawer
        dept={deptView}
        docs={docs}
        onClose={() => setDeptView(null)}
        onEdit={(dp) => {
          setDeptView(null);
          setDeptModal({ open: true, dept: dp });
        }}
        onDelete={(dp) => {
          setDeptView(null);
          setConfirm({ kind: 'dept', item: dp });
        }}
      />
      <ConfirmModal
        open={!!confirm}
        danger
        confirmLabel="Delete"
        title={confirm ? (confirm.kind === 'doc' ? 'Remove Doctor' : 'Delete Department') : ''}
        body={
          confirm
            ? `Are you sure you want to ${confirm.kind === 'doc' ? 'remove' : 'delete'} ${confirm.item.name}? This can't be undone.`
            : ''
        }
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === 'doc') {
            catDeleteDoctor(confirm.item.id);
            toast('Doctor removed', 'info');
          } else {
            catDeleteDept(confirm.item.id);
            toast('Department deleted', 'info');
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}
