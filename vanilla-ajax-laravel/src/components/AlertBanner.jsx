function AlertBanner({ alert }) {
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
