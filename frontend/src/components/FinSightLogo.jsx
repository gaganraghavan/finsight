export default function FinSightLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="finsight-grad-a" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="finsight-grad-b" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="finsight-grad-c" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Eye outline */}
      <ellipse 
        cx="32" 
        cy="32" 
        rx="28" 
        ry="18" 
        stroke="url(#finsight-grad-a)" 
        strokeWidth="2.5" 
        fill="none"
      />
      {/* Pie chart segments */}
      <circle cx="32" cy="32" r="12" fill="url(#finsight-grad-a)"/>
      <path d="M32 32 L32 20 A12 12 0 0 1 44 32 Z" fill="url(#finsight-grad-b)"/>
      <path d="M32 32 L44 32 A12 12 0 0 1 32 44 Z" fill="url(#finsight-grad-c)"/>
    </svg>
  );
}