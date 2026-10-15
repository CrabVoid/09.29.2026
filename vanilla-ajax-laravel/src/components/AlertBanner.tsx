import type { AlertData } from '../types';

// ----- Component props -----
// The alert can be absent while there is no message to show.
interface AlertBannerProps {
  alert: AlertData | null;
}

// ----- Alert display -----
// Render nothing when inactive; otherwise map the alert type to Bootstrap styling.
function AlertBanner({ alert }: AlertBannerProps) {
  if (!alert) {
    return null;
  }

  return (
    <div className={`alert alert-${alert.type} shadow-sm`} role="alert">
      {alert.message}
    </div>
  );
}

export default AlertBanner;
