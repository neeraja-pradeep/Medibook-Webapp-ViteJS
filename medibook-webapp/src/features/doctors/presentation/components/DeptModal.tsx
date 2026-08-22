import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import { DEPT_COLORS, mkWeek } from '@/features/doctors/application/store/catalog.fixtures';
import { useCatalogStore } from '@/features/doctors/application/store/catalog.store';
import type { Dept, DeptStatus, WeekDay } from '@/features/doctors/application/store/catalog.types';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { ImageUpload } from '@/shared/ui/ImageUpload';
import { InfoDot } from '@/shared/ui/InfoDot';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';

import { WeeklyHours } from './WeeklyHours';

/** Editable draft — `fee` is a free-text string until parsed on save (design `d`). */
interface DeptForm {
  id?: string;
  name: string;
  about: string;
  fee: number | string;
  status: DeptStatus;
  color: string;
  week: readonly WeekDay[];
  image: string | null;
  hours: string;
}

/** Blank department with the next color cycled off the current catalog length. */
function makeBlank(): DeptForm {
  const count = useCatalogStore.getState().depts.length;
  return {
    name: '',
    about: '',
    fee: '',
    status: 'Active',
    color: DEPT_COLORS[count % DEPT_COLORS.length],
    week: mkWeek([0, 1, 2, 3, 4, 5], '9:00 am', '6:00 pm'),
    image: null,
    hours: 'Mon–Sat · 9am–6pm',
  };
}

function readImage(e: ChangeEvent<HTMLInputElement>, cb: (dataUrl: string) => void): void {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') cb(reader.result);
  };
  reader.readAsDataURL(file);
}

interface DeptModalProps {
  dept: Dept | null;
  open: boolean;
  onClose: () => void;
}

/** Add / edit department modal (design `DeptModal`). */
export function DeptModal({ dept, open, onClose }: DeptModalProps) {
  const isNew = !dept || !dept.id;
  const catSaveDept = useCatalogStore((s) => s.catSaveDept);
  const [d, setD] = useState<DeptForm>(makeBlank);
  useEffect(() => {
    if (open)
      setD(
        dept
          ? {
              id: dept.id,
              name: dept.name,
              about: dept.about,
              fee: dept.fee,
              status: dept.status,
              color: dept.color,
              week: dept.week,
              image: dept.image ?? null,
              hours: dept.hours,
            }
          : makeBlank(),
      );
  }, [open, dept]);
  const set = <K extends keyof DeptForm>(k: K, v: DeptForm[K]) => setD((x) => ({ ...x, [k]: v }));
  const save = () => {
    if (!d.name) {
      toast('Department name is required', 'error');
      return;
    }
    catSaveDept({ ...d, id: d.id, fee: parseInt(String(d.fee).replace(/[^0-9]/g, ''), 10) || 0 });
    toast(isNew ? 'Department added' : 'Department updated', 'success');
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Add Department' : 'Edit Department'}
      width={680}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={save}>
            {isNew ? 'Add Department' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4.5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4.5">
          <Field label="Department Name" required>
            <TextInput
              value={d.name}
              placeholder="e.g. Cardiology"
              onChange={(v) => set('name', v)}
            />
          </Field>
          <Field label="Base Consultation Fee" required>
            <TextInput
              value={d.fee ? '₹ ' + d.fee : ''}
              placeholder="₹ 0"
              onChange={(v) => set('fee', v)}
            />
          </Field>
          <Field label="About" className="col-span-full">
            <textarea
              value={d.about}
              placeholder="Short description shown in the patient app"
              onChange={(e) => set('about', e.target.value)}
              className="border-border text-body-lg text-text-strong rounded-input box-border h-18.5 w-full resize-none border p-3"
            />
          </Field>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-body text-text-strong font-medium">Department Image</span>
            <InfoDot text="Shown on the department's page in the Medibook patient app." />
          </div>
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => readImage(e, (url) => set('image', url))}
            />
            {d.image ? (
              <img
                src={d.image}
                alt="Department"
                className="border-border h-27.5 w-full rounded-lg border object-cover"
              />
            ) : (
              <ImageUpload label="Upload image" hint="Optional · 800×450" h={110} />
            )}
          </label>
        </div>
        <WeeklyHours
          week={d.week}
          info="Department hours override hospital hours. Doctors can narrow this further."
        />
        <Field label="Status">
          <Select
            value={d.status}
            options={['Active', 'Inactive']}
            onChange={(v) => set('status', v as DeptStatus)}
          />
        </Field>
      </div>
    </Modal>
  );
}
