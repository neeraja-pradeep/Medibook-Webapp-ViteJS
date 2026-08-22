import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/icon-registry';
import { Modal } from '@/shared/ui/Modal';
import { TextInput } from '@/shared/ui/TextInput';
import { toast } from '@/shared/ui/toast/toast.store';

import type { HospitalUser } from '@/features/users-roles/application/store/rbac.types';

type ResetMethod = 'email' | 'otp' | 'manual';

interface ResetModalProps {
  user: HospitalUser | null;
  onClose: () => void;
}

/**
 * Password reset / invite modal (design `Rbac.jsx` `ResetModal`): pick email
 * link, mobile OTP, or a manually set temporary password.
 */
export function ResetModal({ user, onClose }: ResetModalProps) {
  const [method, setMethod] = useState<ResetMethod>('email');
  if (!user) return null;
  const opts: readonly (readonly [ResetMethod, IconName, string, string])[] = [
    ['email', 'mail', 'Email reset link', user.email],
    ['otp', 'smartphone', 'Mobile OTP', user.phone],
    ['manual', 'key-round', 'Set temporary password', 'Share with the user securely'],
  ];
  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="Reset Password"
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            icon={method === 'manual' ? 'key-round' : 'send'}
            onClick={() => {
              toast(
                method === 'otp'
                  ? 'OTP sent to ' + user.phone
                  : method === 'manual'
                    ? 'Temporary password set'
                    : 'Reset link sent to ' + user.email,
                'success',
              );
              onClose();
            }}
          >
            {method === 'manual' ? 'Set Password' : 'Send'}
          </Button>
        </>
      }
    >
      <p className="text-body-lg text-text-body mb-3.5">
        Reset the password for <b>{user.name}</b>. Choose how:
      </p>
      <div className="flex flex-col gap-2.5">
        {opts.map(([k, ic, t, s]) => (
          <div
            key={k}
            onClick={() => setMethod(k)}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md px-3.5 py-3',
              method === k
                ? 'border-blue bg-blue-soft-bg border-2'
                : 'border-border border bg-white',
            )}
          >
            <div
              className={cn(
                'flex size-9 flex-none items-center justify-center rounded-md',
                method === k ? 'bg-blue text-white' : 'bg-grey-300 text-text-muted',
              )}
            >
              <Icon name={ic} size={18} />
            </div>
            <div className="flex-1">
              <div className="text-body text-text-strong font-medium">{t}</div>
              <div className="text-caption text-text-muted">{s}</div>
            </div>
            {method === k && <Icon name="check" size={18} className="text-blue" />}
          </div>
        ))}
        {method === 'manual' && (
          <Field label="Temporary Password">
            <TextInput
              value=""
              placeholder="Enter a temporary password"
              onChange={() => undefined}
            />
          </Field>
        )}
      </div>
    </Modal>
  );
}
