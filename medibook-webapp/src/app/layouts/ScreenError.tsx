import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';

interface ScreenErrorProps {
  onHome: () => void;
  onRetry: () => void;
}

/** Crash fallback card (design `ScreenError` in `Medibook mbAdmin.html`). */
export function ScreenError({ onHome, onRetry }: ScreenErrorProps) {
  return (
    <div className="flex min-h-105 items-center justify-center">
      <Card pad={32} className="max-w-115 text-center">
        <div className="bg-d-100 text-d-500 mx-auto mb-4 flex size-14 items-center justify-center rounded-lg">
          <Icon name="triangle-alert" size={26} />
        </div>
        <div className="text-h2 text-text-strong mb-2">This screen hit a snag</div>
        <p className="text-body text-text-muted mb-5.5">
          {
            "Something didn't load right. You can retry, or head back to the dashboard — your data is safe."
          }
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" icon="refresh-cw" onClick={onRetry}>
            Retry
          </Button>
          <Button icon="house" onClick={onHome}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
