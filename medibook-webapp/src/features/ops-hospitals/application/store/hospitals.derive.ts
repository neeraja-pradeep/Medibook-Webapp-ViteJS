/**
 * Pure deterministic sample generators for non-Apollo tenants, ported 1:1 from
 * the design prototype (`opsDeptsFor` / `opsDocsFor` / `opsBookingsFor` in
 * Ops.jsx). Each takes a hospital record and returns plain data — the Apollo
 * (`APOLLO_HID`) branch reads the hospital app's live stores instead and is
 * handled in the hospitals store layer, NOT here.
 */
import type {
  OpsBooking,
  OpsDept,
  OpsDoctor,
  OpsHospital,
} from '@/features/ops-hospitals/application/store/hospitals.types';

/** Department sample pool — `[name, base fee]` pairs (design `OPS_DEPT_POOL`). */
export const OPS_DEPT_POOL: readonly (readonly [string, number])[] = [
  ['Cardiology', 800],
  ['General Medicine', 500],
  ['Orthopaedics', 700],
  ['Paediatrics', 600],
  ['Gynaecology', 700],
  ['ENT', 500],
  ['Dermatology', 650],
  ['Ophthalmology', 600],
];

/** Doctor-name sample pool (design `OPS_DOC_POOL`). */
export const OPS_DOC_POOL: readonly string[] = [
  'Dr. A. Sharma',
  'Dr. R. Iyer',
  'Dr. K. Patel',
  'Dr. S. Menon',
  'Dr. V. Gupta',
  'Dr. N. Reddy',
  'Dr. P. Das',
  'Dr. M. Khan',
  'Dr. T. Nair',
  'Dr. J. Bose',
  'Dr. L. Verma',
  'Dr. C. Rao',
];

/** Deterministic department roster for a non-Apollo tenant. */
export function opsDeptsForSeed(h: OpsHospital): OpsDept[] {
  const n = 3 + (h.id % 5);
  return Array.from({ length: n }, (_, i) => {
    const [name, fee] = OPS_DEPT_POOL[(h.id + i * 3) % OPS_DEPT_POOL.length];
    return {
      name,
      docs: 2 + ((h.id + i) % 4),
      fee: fee + (h.id % 3) * 50,
      hours: 'Mon–Sat · 9am–6pm',
      status: 'Active',
    };
  });
}

/** Deterministic doctor roster for a non-Apollo tenant. */
export function opsDocsForSeed(h: OpsHospital): OpsDoctor[] {
  const out: OpsDoctor[] = [];
  opsDeptsForSeed(h).forEach((dp, di) => {
    for (let i = 0; i < dp.docs; i++) {
      out.push({
        name: OPS_DOC_POOL[(h.id * 3 + di * 5 + i * 2) % OPS_DOC_POOL.length],
        spec: dp.name === 'General Medicine' ? 'Physician' : `${dp.name} Specialist`,
        dept: dp.name,
        room: String(100 * (di + 1) + i + 1),
        fee: dp.fee,
        rating: (4.2 + ((h.id + di + i) % 8) / 10).toFixed(1),
        days: 5 + ((h.id + i) % 2),
        status: (h.id + di + i) % 7 === 3 ? 'On Leave' : 'Active',
        leave: null,
      });
    }
  });
  return out;
}

/** Deterministic recent bookings for a non-Apollo tenant. */
export function opsBookingsForSeed(h: OpsHospital): OpsBooking[] {
  const names = [
    'Aarav Mehta',
    'Sana Qureshi',
    'Vikram Rao',
    'Meera Nair',
    'Rohit Bansal',
    'Ananya Iyer',
    'Farhan Sheikh',
    'Divya Kulkarni',
    'Kabir Shah',
    'Nidhi Rao',
  ];
  const depts = opsDeptsForSeed(h);
  const rows: readonly (readonly [string, OpsBooking['status']])[] = [
    ['June 14, 2026', 'Scheduled'],
    ['June 13, 2026', 'In Queue'],
    ['June 12, 2026', 'Completed'],
    ['June 11, 2026', h.id % 2 ? 'No-show' : 'Completed'],
    ['June 10, 2026', h.id % 3 ? 'Completed' : 'Cancelled'],
  ];
  return rows.map(([date, status], i) => ({
    id: i,
    patient: names[(h.id * 2 + i * 3) % names.length],
    department: depts[(h.id + i) % depts.length].name,
    date,
    status,
  }));
}
