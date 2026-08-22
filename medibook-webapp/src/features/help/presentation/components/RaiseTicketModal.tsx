import { useState } from 'react';

import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';

import { useSettingsStore } from '@/features/settings/application/store/settings.store';
import { useSettlementsStore } from '@/features/settlements/application/store/settlements.store';

/** Topic options offered on the ticket form (design `Select` options). */
const TOPIC_OPTIONS = [
  'Billing & settlements',
  'Appointments & queue',
  'Plan & subscription',
  'Technical issue',
  'Other',
] as const;

interface RaiseTicketModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Raise a Support Ticket" modal (design `Admin.jsx` `HelpSupport`): topic
 * select + free-text description. Sending calls the settlements store's
 * `raiseTicket` with the subject `"<topic> — <hospital name>"`, which lands the
 * ticket in the ops inbox.
 */
export function RaiseTicketModal({ open, onClose }: RaiseTicketModalProps) {
  const raiseTicket = useSettlementsStore((s) => s.raiseTicket);
  const hospitalName = useSettingsStore((s) => s.settings.name);
  const [topic, setTopic] = useState<string>(TOPIC_OPTIONS[0]);
  const [message, setMessage] = useState('');

  const send = () => {
    raiseTicket(`${topic} — ${hospitalName}`, message);
    onClose();
    setMessage('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Raise a Support Ticket"
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="send" onClick={send}>
            Send to Medibook
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Topic">
          <Select value={topic} options={TOPIC_OPTIONS} onChange={setTopic} />
        </Field>
        <Field label="Describe the issue">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's happening?"
            className="rounded-input border-border text-body-lg text-text-strong h-24 w-full resize-none border p-3"
          />
        </Field>
        <div className="text-caption text-text-muted">
          Tickets go straight to the Medibook operations team — they appear in their console
          notifications.
        </div>
      </div>
    </Modal>
  );
}
