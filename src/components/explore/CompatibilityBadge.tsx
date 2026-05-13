import { compatibilityColor, compatibilityLabel } from '@/lib/compatibility'

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function CompatibilityBadge({ score, size = 'md', showLabel = false }: Props) {
  const colorClass = compatibilityColor(score)
  const label      = compatibilityLabel(score)

  const sizeClass = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : size === 'lg'
    ? 'text-sm px-3 py-1.5'
    : 'text-xs px-2.5 py-1'

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${sizeClass} ${colorClass}`}
         style={{ borderColor: 'transparent' }}>
      {/* Radial progress indicator */}
      <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        <circle
          cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2"
          strokeDasharray={`${(score / 100) * 37.7} 37.7`}
          strokeLinecap="round"
          transform="rotate(-90 8 8)"
        />
      </svg>
      <span>{score}%</span>
      {showLabel && <span className="font-medium opacity-80">{label}</span>}
    </div>
  )
}
