export function HeartIcon({
  filled = false,
  className = "h-5 w-5",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 20.4L10.6 19.15C5.6 14.64 2.4 11.74 2.4 8.2C2.4 5.3 4.7 3 7.6 3C9.25 3 10.84 3.78 12 5C13.16 3.78 14.75 3 16.4 3C19.3 3 21.6 5.3 21.6 8.2C21.6 11.74 18.4 14.64 13.4 19.15L12 20.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M15 19L8 12L15 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M9 19L16 12L9 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M3.5 5.5H5.5L7.8 15.2C7.93 15.75 8.42 16.14 8.98 16.14H18.67C19.17 16.14 19.61 15.81 19.74 15.33L21 10H8.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.4" cy="19.2" r="1.4" fill="currentColor" />
      <circle cx="17.3" cy="19.2" r="1.4" fill="currentColor" />
    </svg>
  );
}
