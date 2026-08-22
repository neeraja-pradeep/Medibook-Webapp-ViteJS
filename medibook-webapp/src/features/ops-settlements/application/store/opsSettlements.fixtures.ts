/**
 * Seed data for ops settlements — transcribed verbatim from the design
 * prototype's `OpsDB.settlements` (Ops.jsx). `hid` values are materialized
 * from the prototype's `OPS_NAME_TO_ID` back-fill. Apollo's rows live in the
 * hospital app's settlements store; the ops screen merges both lists.
 */
import type { OpsSettlementSeed } from '@/features/ops-settlements/application/store/opsSettlements.types';

export const OPS_SETTLEMENTS: readonly OpsSettlementSeed[] = [
  {
    id: 'MB-ST-2408',
    hid: 6,
    hospital: 'Meridian City Hospital',
    period: '10 – 16 Jun 2026',
    gross: 186000,
    expected: '2026-06-20',
    status: 'Pending',
  },
  {
    id: 'MB-ST-2409',
    hid: 8,
    hospital: 'Trinity Care & Research',
    period: '10 – 16 Jun 2026',
    gross: 142500,
    expected: '2026-06-20',
    status: 'Pending',
  },
  {
    id: 'MB-ST-2410',
    hid: 1,
    hospital: 'Sunrise Multispeciality',
    period: '03 – 09 Jun 2026',
    gross: 96400,
    expected: '2026-06-13',
    status: 'Released',
    utr: 'UTR26-2410R',
    releasedAmt: 80000,
    remark: 'Part release — balance held pending dispute #418.',
  },
  {
    id: 'MB-ST-2411',
    hid: 2,
    hospital: 'Lotus Heart Institute',
    period: '10 – 16 Jun 2026',
    gross: 112800,
    expected: '2026-06-20',
    status: 'Pending',
  },
  {
    id: 'MB-ST-2412',
    hid: 7,
    hospital: 'Vasudha Medical Centre',
    period: '27 May – 02 Jun 2026',
    gross: 78300,
    expected: '2026-06-06',
    status: 'Received',
    utr: 'UTR26-2412K',
    receivedOn: '2026-06-06',
  },
  {
    id: 'MB-ST-2413',
    hid: 12,
    hospital: 'Charak Institute of Medicine',
    period: '03 – 09 Jun 2026',
    gross: 104600,
    expected: '2026-06-13',
    status: 'Payout failed',
  },
  {
    id: 'MB-ST-2414',
    hid: 11,
    hospital: 'Himgiri Wellness Hospital',
    period: '27 May – 02 Jun 2026',
    gross: 52900,
    expected: '2026-06-06',
    status: 'Received',
    utr: 'UTR26-2414K',
    receivedOn: '2026-06-07',
  },
  {
    id: 'MB-ST-2415',
    hid: 3,
    hospital: 'Kaveri General Hospital',
    period: '10 – 16 Jun 2026',
    gross: 31200,
    expected: '2026-06-20',
    status: 'Pending',
  },
];
