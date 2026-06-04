import { useId } from 'react';

export default function VectorSpaceLogo({ width = 40, height = 40, className = '' }) {
  const gradientId = 'vs-gradient-' + useId().replace(/:/g, '');
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#005F73" />
          <stop offset="100%" stopColor="#94D2BD" />
        </linearGradient>
      </defs>
      <path
        d="M 43 52 L 36 40 L 20 40 L 42 76 L 78 16"
        stroke={`url(#${gradientId})`}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
