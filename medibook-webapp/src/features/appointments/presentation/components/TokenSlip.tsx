import type { Appointment } from '@/features/appointments/application/store/appointments.types';

/** Demo hospital identity — the design read this from `window.__hospital`. */
const HOSPITAL_NAME = 'Apollo Hospital';

interface TokenSlipProps {
  appt: Appointment;
}

/** Printable queue-token slip (design `Flows.jsx` `TokenSlip`). */
export function TokenSlip({ appt }: TokenSlipProps) {
  return (
    <div className="border-border mx-auto w-65 rounded-lg border border-dashed bg-white p-5 text-center">
      <div className="text-text-navy text-[13px] font-bold tracking-[.04em]">{HOSPITAL_NAME}</div>
      <div className="text-caption text-text-muted mb-3">Queue Token</div>
      <div className="text-blue text-[52px] leading-none font-extrabold">{appt.token}</div>
      <div className="bg-border-soft my-3.5 h-px"></div>
      <div className="text-body text-text-body flex flex-col gap-1.25">
        <div className="flex justify-between">
          <span className="text-text-muted">Patient</span>
          <b>{appt.name}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Doctor</span>
          <span>{appt.doctor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Dept</span>
          <span>{appt.dept}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Time</span>
          <span>
            {appt.date} · {appt.time}
          </span>
        </div>
      </div>
      <div className="text-caption text-text-faint mt-3.5">
        Please wait for your token to be called.
      </div>
    </div>
  );
}
