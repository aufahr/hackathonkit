"use client";

interface ElevenLabsLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function ElevenLabsLogo({ className, width = 200, height = 40 }: ElevenLabsLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ElevenLabs text logo representation */}
      <text
        x="0"
        y="30"
        fontSize="28"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ElevenLabs
      </text>
    </svg>
  );
}

export function ElevenLabsIcon({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sound wave bars representing ElevenLabs */}
      <rect x="4" y="12" width="4" height="16" rx="2" fill="currentColor" />
      <rect x="12" y="6" width="4" height="28" rx="2" fill="currentColor" />
      <rect x="20" y="10" width="4" height="20" rx="2" fill="currentColor" />
      <rect x="28" y="4" width="4" height="32" rx="2" fill="currentColor" />
      <rect x="36" y="14" width="4" height="12" rx="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
