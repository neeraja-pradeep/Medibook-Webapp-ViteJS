import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { SectionTitle } from '@/shared/ui/SectionTitle';

import { RaiseTicketModal } from '@/features/help/presentation/components/RaiseTicketModal';

interface HelpCategory {
  readonly icon: IconName;
  readonly title: string;
  readonly subtitle: string;
}

/** The four help category tiles (design `HelpSupport` `cats`). */
const CATEGORIES: readonly HelpCategory[] = [
  { icon: 'rocket', title: 'Getting Started', subtitle: 'Setup & first steps' },
  { icon: 'calendar-days', title: 'Appointments', subtitle: 'Booking & queue' },
  { icon: 'wallet', title: 'Billing', subtitle: 'Payments & invoices' },
  { icon: 'scale', title: 'Settlements', subtitle: 'Medibook transfers' },
];

/** Frequently asked questions as `[question, answer]` pairs (design `FAQS`). */
const FAQS: readonly (readonly [string, string])[] = [
  [
    'How do I add a walk-in appointment?',
    'Go to Appointments → New Appointment, set Appointment type to Walk-in, choose the department, doctor and time, then record the payment — the receipt and queue token are generated automatically.',
  ],
  [
    'How is the token queue updated?',
    'Tokens advance automatically when a doctor marks a patient Done, or manually via Call Next on the Token Management screen. Token numbers are issued as a hospital-wide running sequence.',
  ],
  [
    'How do settlements work?',
    'For online bookings, Medibook collects the fee, keeps a 10% commission, and transfers the net to the hospital by the expected date. Track and reconcile each transfer in Billing & Settlements — mark it Received once it reaches your account. Walk-in payments are collected at the desk and kept 100% by the hospital.',
  ],
  [
    'Can I export reports?',
    'Yes — every report supports CSV and PDF export from the Reports screen using the Export button.',
  ],
];

/** Contact channels as `[icon, title, subtitle]` tuples (design `HelpSupport`). */
const CONTACTS: readonly (readonly [IconName, string, string])[] = [
  ['mail', 'Email Support', 'support@medibook.app'],
  ['phone', 'Call Us', '1800 200 4567'],
  ['message-circle', 'Live Chat', 'Mon–Sat, 9am–7pm'],
];

/**
 * Help & Support screen (design `Admin.jsx` `HelpSupport`): the navy hero with
 * a search field, four category tiles, the FAQ accordion (first item open by
 * default), the contact cards, and the "Raise a Ticket" flow.
 */
export function HelpSupportScreen() {
  const [open, setOpen] = useState(0);
  const [ticket, setTicket] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="shadow-card bg-p-500 rounded-xl p-9 text-center">
        <div className="mb-2 text-[26px] font-bold text-white">How can we help?</div>
        <div className="text-body mb-5.5 text-white/75">
          Search our help center or browse common topics.
        </div>
        <div className="text-text-muted mx-auto flex h-13 max-w-130 items-center gap-3 rounded-lg bg-white px-4.5">
          <Icon name="search" size={20} />
          <input
            placeholder="Search for help..."
            className="text-body-lg text-text-strong flex-1 border-none bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {CATEGORIES.map((c) => (
          <Card key={c.title} hover onClick={() => undefined} pad={22} className="text-center">
            <div className="bg-blue-soft-bg text-blue mx-auto mb-3 flex size-12 items-center justify-center rounded-lg">
              <Icon name={c.icon} size={24} />
            </div>
            <div className="text-body text-text-strong font-semibold">{c.title}</div>
            <div className="text-caption text-text-muted mt-1">{c.subtitle}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-5">
        <Card className="flex-2">
          <SectionTitle size={16} className="mb-4">
            Frequently Asked Questions
          </SectionTitle>
          <div className="flex flex-col gap-2.5">
            {FAQS.map(([q, a], i) => (
              <div key={q} className="border-border-soft overflow-hidden rounded-md border">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between px-4.5 py-4 text-left transition-colors duration-150',
                    open === i ? 'bg-grey-200' : 'bg-white',
                  )}
                >
                  <span className="text-body text-text-strong font-medium">{q}</span>
                  <Icon
                    name={open === i ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    className="text-text-muted"
                  />
                </button>
                {open === i && (
                  <div className="text-body text-text-body px-4.5 pb-4.5 leading-[1.7]">{a}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex-1" pad={24}>
          <SectionTitle size={16} className="mb-4">
            Still need help?
          </SectionTitle>
          <div className="flex flex-col gap-3.5">
            {CONTACTS.map(([ic, t, s]) => (
              <div
                key={t}
                className="border-border-soft flex items-center gap-3.5 rounded-md border p-3.5"
              >
                <div className="bg-blue-soft-bg text-blue flex size-10 flex-none items-center justify-center rounded-md">
                  <Icon name={ic} size={19} />
                </div>
                <div>
                  <div className="text-body text-text-strong font-medium">{t}</div>
                  <div className="text-caption text-text-muted">{s}</div>
                </div>
              </div>
            ))}
            <Button icon="ticket" className="mt-1 w-full" onClick={() => setTicket(true)}>
              Raise a Ticket
            </Button>
          </div>
        </Card>
      </div>

      <RaiseTicketModal open={ticket} onClose={() => setTicket(false)} />
    </div>
  );
}
