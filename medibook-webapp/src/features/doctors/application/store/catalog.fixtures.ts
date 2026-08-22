/**
 * Doctors & Departments seed catalog, transcribed verbatim from the design
 * prototype (`Catalog.jsx` `DEPTS_DATA` / `DOCS_DATA` / `DEPT_COLORS`).
 * Ids materialize the prototype's `catSeed()` mapping ("dp" + index /
 * "dc" + index). Colors are the concrete hex values of the design's CSS
 * var tokens because they feed data-driven inline styles.
 */

import type { Dept, Doctor, WeekDay } from './catalog.types';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Build a weekly-hours grid: `onDays` are indexes into DAYS (0 = Mon). */
export function mkWeek(onDays: readonly number[], from: string, to: string): WeekDay[] {
  return DAYS.map((d, i) => ({ day: d, on: onDays.includes(i), from, to }));
}

export const DEPTS_DATA: readonly Dept[] = [
  {
    id: 'dp0',
    name: 'Cardiology',
    about: 'Heart and vascular care — consultations, ECG, echo.',
    fee: 800,
    hours: 'Mon–Sat · 9am–6pm',
    status: 'Active',
    color: '#2563eb',
    week: mkWeek([0, 1, 2, 3, 4, 5], '9:00 am', '6:00 pm'),
  },
  {
    id: 'dp1',
    name: 'Orthopedics',
    about: 'Bone, joint and spine care.',
    fee: 700,
    hours: 'Mon–Sat · 10am–6pm',
    status: 'Active',
    color: '#3f5e85',
    week: mkWeek([0, 1, 2, 3, 4, 5], '10:00 am', '6:00 pm'),
  },
  {
    id: 'dp2',
    name: 'Pediatrics',
    about: 'Child health and vaccinations.',
    fee: 600,
    hours: 'Mon–Sat · 9am–4pm',
    status: 'Active',
    color: '#2ecc71',
    week: mkWeek([0, 1, 2, 3, 4, 5], '9:00 am', '4:00 pm'),
  },
  {
    id: 'dp3',
    name: 'Neurology',
    about: 'Brain and nervous system care.',
    fee: 1000,
    hours: 'Tue–Sat · 10am–5pm',
    status: 'Active',
    color: '#f59e0b',
    week: mkWeek([1, 2, 3, 4, 5], '10:00 am', '5:00 pm'),
  },
  {
    id: 'dp4',
    name: 'ENT',
    about: 'Ear, nose and throat.',
    fee: 500,
    hours: 'Mon–Fri · 9am–5pm',
    status: 'Active',
    color: '#2055ca',
    week: mkWeek([0, 1, 2, 3, 4], '9:00 am', '5:00 pm'),
  },
  {
    id: 'dp5',
    name: 'Dermatology',
    about: 'Skin, hair and nails.',
    fee: 650,
    hours: 'Mon–Sat · 11am–6pm',
    status: 'Inactive',
    color: '#8095ae',
    week: mkWeek([0, 1, 2, 3, 4, 5], '11:00 am', '6:00 pm'),
  },
];

export const DOCS_DATA: readonly Doctor[] = [
  {
    id: 'dc0',
    name: 'Dr. Thomas K.',
    depts: ['Cardiology'],
    spec: 'Cardiologist',
    room: '101',
    fee: 800,
    rating: 4.9,
    reviews: 128,
    status: 'Active',
    week: mkWeek([0, 1, 2, 3, 4], '9:00 am', '5:00 pm'),
    leave: [{ from: '18 Jun', to: '20 Jun', reason: 'Conference' }],
    list: [
      {
        a: 'Ramesh G.',
        r: 5,
        d: '2 days ago',
        t: 'Very thorough and patient. Explained everything clearly.',
      },
      { a: 'Priya N.', r: 5, d: '1 week ago', t: 'Short wait, great consultation.' },
      { a: 'Imran S.', r: 4, d: '2 weeks ago', t: 'Good doctor, clinic was a little busy.' },
    ],
  },
  {
    id: 'dc1',
    name: 'Dr. Anil R.',
    depts: ['Cardiology'],
    spec: 'Cardiologist',
    room: '102',
    fee: 800,
    rating: 4.6,
    reviews: 64,
    status: 'Active',
    week: mkWeek([0, 1, 2, 3, 4, 5], '10:00 am', '6:00 pm'),
    leave: [],
    list: [
      { a: 'Sara K.', r: 5, d: '3 days ago', t: 'Caring and knowledgeable.' },
      { a: 'John M.', r: 4, d: '1 week ago', t: 'Helpful.' },
    ],
  },
  {
    id: 'dc2',
    name: 'Dr. Geetha R.',
    depts: ['Orthopedics'],
    spec: 'Orthopedic Surgeon',
    room: '201',
    fee: 700,
    rating: 4.7,
    reviews: 91,
    status: 'Active',
    week: mkWeek([0, 1, 2, 3, 4, 5], '10:00 am', '6:00 pm'),
    leave: [{ from: '25 Jun', to: '25 Jun', reason: 'Personal' }],
    list: [{ a: 'Arun P.', r: 5, d: '4 days ago', t: 'Fixed my knee pain. Highly recommend.' }],
  },
  {
    id: 'dc3',
    name: 'Dr. Kumar V.',
    depts: ['Pediatrics'],
    spec: 'Pediatrician',
    room: '301',
    fee: 600,
    rating: 4.8,
    reviews: 142,
    status: 'On Leave',
    week: mkWeek([1, 2, 3, 4, 5], '9:00 am', '4:00 pm'),
    leave: [{ from: '10 Jun', to: '16 Jun', reason: 'Medical leave' }],
    list: [
      { a: 'Nisha R.', r: 5, d: '5 days ago', t: 'Wonderful with kids.' },
      { a: 'Fatima S.', r: 5, d: '2 weeks ago', t: 'Gentle and reassuring.' },
    ],
  },
  {
    id: 'dc4',
    name: 'Dr. Maya S.',
    depts: ['Neurology'],
    spec: 'Neurologist',
    room: '401',
    fee: 1000,
    rating: 4.5,
    reviews: 53,
    status: 'Active',
    week: mkWeek([1, 2, 3, 4, 5], '10:00 am', '5:00 pm'),
    leave: [],
    list: [{ a: 'Vikram D.', r: 4, d: '1 week ago', t: 'Detailed and professional.' }],
  },
  {
    id: 'dc5',
    name: 'Dr. Arun B.',
    depts: ['ENT'],
    spec: 'ENT Specialist',
    room: '501',
    fee: 500,
    rating: 4.4,
    reviews: 38,
    status: 'Active',
    week: mkWeek([0, 1, 2, 3, 4], '9:00 am', '5:00 pm'),
    leave: [],
    list: [{ a: 'Daniel J.', r: 4, d: '6 days ago', t: 'Quick and effective.' }],
  },
  {
    id: 'dc6',
    name: 'Dr. Leela P.',
    depts: ['Dermatology'],
    spec: 'Dermatologist',
    room: '601',
    fee: 650,
    rating: 4.6,
    reviews: 47,
    status: 'Active',
    week: mkWeek([0, 1, 2, 3, 4, 5], '11:00 am', '6:00 pm'),
    leave: [],
    list: [{ a: 'Maya R.', r: 5, d: '3 days ago', t: 'Skin cleared up in weeks.' }],
  },
];

/**
 * Palette cycled for newly created departments (design `DEPT_COLORS`,
 * CSS vars replaced with their concrete hex values):
 * blue, p-400, g-500, y-500, blue-strong, p-300, orange.
 */
export const DEPT_COLORS: readonly string[] = [
  '#2563eb',
  '#3f5e85',
  '#2ecc71',
  '#f59e0b',
  '#2055ca',
  '#8095ae',
  '#ea7c2b',
];
