import type { PlatformId } from '../types/domain';

export function BrandLogoMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="8" fill="#0F172A" />
      <path
        d="M11 20C11 15.0294 15.0294 11 20 11C22.9765 11 25.616 12.4447 27.2569 14.6716"
        stroke="#F8FAFC"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path
        d="M27.2569 25.3284C25.616 27.5553 22.9765 29 20 29C15.0294 29 11 24.9706 11 20"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path
        d="M21 16H27.5C29.433 16 31 17.567 31 19.5C31 21.433 29.433 23 27.5 23H21V16Z"
        stroke="#F8FAFC"
        strokeWidth="2.2"
      />
      <path d="M26 23L29.5 28" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className = 'w-5 h-5',
}: {
  platform: PlatformId;
  className?: string;
}) {
  switch (platform) {
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="2.5"
            y="5.5"
            width="19"
            height="13"
            rx="3.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M10 9.25L15.25 12L10 14.75V9.25Z" fill="currentColor" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M14.5 4V14.5C14.5 16.7091 12.7091 18.5 10.5 18.5C8.29086 18.5 6.5 16.7091 6.5 14.5C6.5 12.2909 8.29086 10.5 10.5 10.5C11.0235 10.5 11.5236 10.6005 11.9819 10.7834"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M14.5 4C15.2 6.8 17.2 8.6 19.5 9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="4.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M20.5 4.5L3.5 11.2L9.5 13.4L17.2 7.8L11.8 14.4L17.5 19.2L20.5 4.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="3.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M15.5 8.5H13.8C12.8 8.5 12.2 9.1 12.2 10.1V20.5M9.5 13H15"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M8 10.5V16.5M8 7.5V7.6M11.5 16.5V10.5M11.5 12.8C11.5 11.4 12.6 10.5 14 10.5C15.4 10.5 16.2 11.4 16.2 13V16.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M10.2 19.5L11.8 13.2M11.8 13.2C11.4 12.6 11.2 11.8 11.5 10.9C11.9 9.7 13.1 9 14.3 9.2C15.6 9.4 16.3 10.6 16 12C15.6 13.6 14.1 14.6 12.8 14.1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 4.5C9.5 4.5 8 6.4 8 9V11.2C7.2 11.4 6.3 11.5 5.8 11.8C6.5 12.7 7.6 13.2 7.8 13.8C7.6 14.8 6.3 16 4.8 16.6C6.4 17.2 7.5 17.6 8.3 18.3C9.1 19 10.3 19.5 12 19.5C13.7 19.5 14.9 19 15.7 18.3C16.5 17.6 17.6 17.2 19.2 16.6C17.7 16 16.4 14.8 16.2 13.8C16.4 13.2 17.5 12.7 18.2 11.8C17.7 11.5 16.8 11.4 16 11.2V9C16 6.4 14.5 4.5 12 4.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.25C7.17 3.25 3.25 7.17 3.25 12C3.25 13.71 3.74 15.3 4.59 16.65L3.4 20.6L7.48 19.44C8.81 20.22 10.35 20.75 12 20.75C16.83 20.75 20.75 16.83 20.75 12C20.75 7.17 16.83 3.25 12 3.25Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 8.75C9.18 8.75 8.83 8.83 8.54 9.15C8.24 9.48 7.45 10.22 7.45 11.73C7.45 13.24 8.55 14.7 8.7 14.9C8.86 15.1 10.85 18.29 14.02 19.51C16.65 20.53 17.18 20.33 17.76 20.27C18.33 20.22 19.6 19.52 19.86 18.79C20.12 18.06 20.12 17.44 20.04 17.31C19.96 17.18 19.75 17.1 19.43 16.94C19.12 16.78 17.56 16.02 17.27 15.91C16.98 15.81 16.77 15.76 16.56 16.08C16.35 16.4 15.75 17.1 15.57 17.31C15.39 17.52 15.2 17.54 14.89 17.39C14.57 17.23 13.55 16.89 12.34 15.81C11.39 14.97 10.76 13.93 10.57 13.61C10.39 13.29 10.55 13.12 10.71 12.96C10.85 12.82 11.02 12.59 11.18 12.41C11.34 12.22 11.39 12.09 11.5 11.88C11.6 11.67 11.55 11.49 11.47 11.33C11.39 11.17 10.78 9.65 10.52 9.03C10.28 8.46 10.03 8.53 9.84 8.52L9.4 8.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

