import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, } from '@heroicons/react/24/solid';
import { JSX } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const toastTypes: Record<ToastType, { icon: JSX.Element; title: string; defaultMessage: string; color: string; }> = {
  success: {
    icon: <CheckCircleIcon className="h-10 w-10 text-green-500" />,
    title: 'Success',
    defaultMessage: 'Your changes are saved successfully.',
    color: 'border-l-green-500',
  },
  error: {
    icon: <XCircleIcon className="h-10 w-10 text-red-500" />,
    title: 'Error',
    defaultMessage: 'An error occurred while saving changes.',
    color: 'border-l-red-500',
  },
  info: {
    icon: <InformationCircleIcon className="h-10 w-10 text-cyan-500" />,
    title: 'Info',
    defaultMessage: 'New settings available on your account.',
    color: 'border-l-cyan-500',
  },
  warning: {
    icon: <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" />,
    title: 'Warning',
    defaultMessage: 'Username you have entered is invalid.',
    color: 'border-l-yellow-500',
  },
};

export function showCustomToast(type: ToastType = 'success', customMessage = '') {
  const { icon, title, defaultMessage, color } = toastTypes[type];
  const message = customMessage || defaultMessage;

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 ${color} !z-[100] relative`}
    >
      <div className="flex p-4 w-full items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-md font-bold font-mono text-black">{title.toUpperCase()}</p>
          <p className="text-sm font-geist leading-relaxed text-gray-600">{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 p-1 rounded-sm px-2 bg-red-500 hover:bg-red-700 font-bold text-white"
        >
          ✕
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-right',
  });
}