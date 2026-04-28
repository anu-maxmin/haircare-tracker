// components/Toast.js
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 3500);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: 'bg-moss text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-bark text-white',
    warning: 'bg-mink text-white',
  };

  return (
    <div className={`toast fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2 max-w-xs ${colors[type]} ${!visible ? 'opacity-0 transition-opacity duration-400' : ''}`}>
      {type === 'success' && '✓ '}
      {type === 'error' && '✕ '}
      {type === 'info' && '🌿 '}
      {message}
    </div>
  );
}
