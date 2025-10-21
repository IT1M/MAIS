import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 4000,
    icon: '✓',
    style: {
      borderRadius: '8px',
      background: '#10b981',
      color: '#fff',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 6000,
    icon: '✕',
    style: {
      borderRadius: '8px',
      background: '#ef4444',
      color: '#fff',
    },
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 4000,
    icon: 'ℹ️',
    style: {
      borderRadius: '8px',
      background: '#3b82f6',
      color: '#fff',
    },
  });
};

export const showWarningToast = (message: string) => {
  toast(message, {
    duration: 5000,
    icon: '⚠️',
    style: {
      borderRadius: '8px',
      background: '#f59e0b',
      color: '#fff',
    },
  });
};
