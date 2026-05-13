'use client'

import { INTEREST_TAGS, type OnboardingData } from '@/types'

const TAG_EMOJIS: Record<string, string> = {
  Gaming: '🎮', Sports: '⚽', Cooking: '🍳', Reading: '📚', Music: '🎵',
  'Art & Design': '🎨', 'Film & TV': '🎬', Travel: '✈️', 'Gym & Fitness': '💪',
  Yoga: '🧘', Photography: '📸', Dancing: '💃', Coding: '💻', Fashion: '👗',
  Foodie: '🍜', 'Nature & Hiking': '🏔️', Volunteering: '🤝', Chess: '♟️',
  Podcasts: '🎙️', 'Coffee Lover': '☕',
}

interface Props {
  data: OnboardingData['step3']
  onChange: (vals: Partial<OnboardingData['step3']>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Interests({ data, onChange, onNext, onBack }: Props) {
  function toggle(tag: string) {
    const has = data.tags.includes(tag)
    const next = has ? data.tags.filter(t => t !== tag) : [...data.tags, tag]
    onChange({ tags: next.slice(0, 12) })
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Your interests</h2>
        <p className="text-slate-400 text-sm">
          Pick up to 12. These power your compatibility score.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-wrap gap-2.5 pb-2">
          {INTEREST_TAGS.map(tag => {
            const selected = data.tags.includes(tag)
            const atLimit  = data.tags.length >= 12 && !selected
            return (
              <button
                key={tag}
                type="button"
                onClick={() => !atLimit && toggle(tag)}
                disabled={atLimit}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                  selected
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : atLimit
                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                <span>{TAG_EMOJIS[tag]}</span>
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selection counter */}
      <div className="mt-4 mb-2 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {data.tags.length > 0 ? (
            <span className="text-brand-600 font-semibold">{data.tags.length} selected</span>
          ) : (
            'Select at least 1 interest'
          )}
        </div>
        <div className="text-xs text-slate-300">Max 12</div>
      </div>

      {/* Selected preview */}
      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.tags.map(tag => (
            <span key={tag} className="text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full font-medium">
              {TAG_EMOJIS[tag]} {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-brand-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={data.tags.length === 0}
          className="flex-[2] bg-gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
