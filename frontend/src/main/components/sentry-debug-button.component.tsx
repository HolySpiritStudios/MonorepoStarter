import { useEffect, useState } from 'react';

import { getSentryEventService } from '../services/service-container.service';

export function SentryDebugButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowButton(urlParams.get('debug') === 'true');
  }, []);

  if (!showButton) {
    return null;
  }

  const handleDebugTest = () => {
    getSentryEventService().debugTest();
  };

  return (
    <button
      onClick={handleDebugTest}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        padding: '8px 12px',
        backgroundColor: '#ff4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      Test Sentry Proxy
    </button>
  );
}
