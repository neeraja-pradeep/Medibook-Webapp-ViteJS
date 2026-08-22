import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import { AUTH_LOGIN_PATH } from '@/app/router/paths';

import { AuthField } from '@/features/auth/presentation/components/AuthField';
import { BrandPanel } from '@/features/auth/presentation/components/BrandPanel';

/**
 * Forgot-password screen (design `Auth.jsx` `ForgotPassword`): the request
 * state (email + Send Mail) and the sent state (mail-check confirmation with
 * the email echo), plus the back-to-login link — ported 1:1.
 */
export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const back = () => navigate(AUTH_LOGIN_PATH);

  return (
    <div className="flex h-full bg-white">
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-10">
        <div className="w-full max-w-100">
          <button
            type="button"
            onClick={back}
            className="text-body text-text-muted mb-7 inline-flex cursor-pointer items-center gap-2 font-medium"
          >
            <Icon name="arrow-left" size={18} /> Back to login
          </button>
          {!sent ? (
            <>
              <div className="text-text-strong mb-2 text-[32px] leading-[1.1] font-bold">
                Forgot Password?
              </div>
              <p className="text-body text-text-muted mb-7.5">
                Enter the email linked to your staff account and we'll send a reset link.
              </p>
              <div className="flex flex-col gap-5">
                <AuthField
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@hospital.med"
                />
                <Button
                  variant="info"
                  icon="mail"
                  className="h-13.5 w-full rounded-sm"
                  onClick={() => setSent(true)}
                >
                  Send Mail
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-g-100 text-g-600 mx-auto mb-5.5 flex size-18 items-center justify-center rounded-full">
                <Icon name="mail-check" size={34} />
              </div>
              <div className="text-text-strong mb-2.5 text-[26px] font-bold">Check your inbox</div>
              <p className="text-body text-text-muted mx-auto mb-7 max-w-80">
                We've sent a password reset link to{' '}
                <b className="text-text-body">{email || 'your email'}</b>. The link expires in 30
                minutes.
              </p>
              <Button variant="info" className="h-13.5 w-full rounded-sm" onClick={back}>
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
