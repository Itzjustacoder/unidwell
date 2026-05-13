'use client'

import { Moon, Sun, Sparkles, Users, PersonStanding, Coffee, Volume2, VolumeX, Dog } from 'lucide-react'
import type { OnboardingData } from '@/types'

interface Props {
  data: OnboardingData['step2']
  onChange: (vals: Partial<OnboardingData['step2']>) => void
  onNext: () => void
  onBack: () => void
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; icon?: React.ReactNode }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
        {label}
      </label>
      <div className={`grid gap-2 ${options.length <= 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
              value === o.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-100 bg-white text-slate-500 hover:border-brand-200'
            }`}
          >
            {o.icon && <span className="text-base">{o.icon}</span>}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Step2Lifestyle({ data, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Your lifestyle</h2>
        <p className="text-slate-400 text-sm">Honest answers lead to better matches. No judgement.</p>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto scrollbar-hide pb-2">
        <OptionGroup
          label="Sleep Schedule"
          value={data.sleep_schedule}
          onChange={v => onChange({ sleep_schedule: v })}
          options={[
            { value: 'early_bird',  label: 'Early Bird', icon: <Sun size={18} className="text-amber-400" /> },
            { value: 'night_owl',   label: 'Night Owl',  icon: <Moon size={18} className="text-indigo-500" /> },
            { value: 'flexible',    label: 'Flexible',   icon: <Sparkles size={18} className="text-brand-400" /> },
          ]}
        />

        {/* Cleanliness */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
            Cleanliness Level
          </label>
          <div className="bg-white border-2 border-slate-100 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>1 - Relaxed</span>
              <span>5 - Spotless</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={data.cleanliness_level}
              onChange={e => onChange({ cleanliness_level: parseInt(e.target.value) })}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <div
                  key={n}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    n === data.cleanliness_level
                      ? 'bg-brand-600 text-white scale-110'
                      : 'bg-brand-100 text-brand-400'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>

        <OptionGroup
          label="Social Preference"
          value={data.social_preference}
          onChange={v => onChange({ social_preference: v })}
          options={[
            { value: 'social',   label: 'Very Social',   icon: <Users size={18} className="text-emerald-500" /> },
            { value: 'balanced', label: 'Balanced',       icon: <Sparkles size={18} className="text-brand-400" /> },
            { value: 'private',  label: 'Private',        icon: <PersonStanding size={18} className="text-slate-400" /> },
          ]}
        />

        <OptionGroup
          label="Smoking"
          value={data.smoking}
          onChange={v => onChange({ smoking: v })}
          options={[
            { value: 'non_smoker',    label: 'Non-smoker' },
            { value: 'outside_only',  label: 'Outside Only' },
            { value: 'smoker',        label: 'Smoker' },
          ]}
        />

        <OptionGroup
          label="Guests"
          value={data.guests_frequency}
          onChange={v => onChange({ guests_frequency: v })}
          options={[
            { value: 'often',         label: 'Often' },
            { value: 'occasionally',  label: 'Occasionally' },
            { value: 'rarely',        label: 'Rarely' },
            { value: 'never',         label: 'Never' },
          ]}
        />

        <OptionGroup
          label="Noise Tolerance"
          value={data.noise_tolerance}
          onChange={v => onChange({ noise_tolerance: v })}
          options={[
            { value: 'quiet',    label: 'Quiet', icon: <VolumeX size={18} className="text-slate-400" /> },
            { value: 'moderate', label: 'Moderate', icon: <Volume2 size={18} className="text-brand-400" /> },
            { value: 'loud',     label: 'Loud', icon: <Volume2 size={18} className="text-rose-400" /> },
          ]}
        />

        {/* Pet friendly toggle */}
        <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Dog size={20} className="text-amber-500" />
            <div>
              <div className="text-sm font-semibold text-slate-700">Pet Friendly</div>
              <div className="text-xs text-slate-400">OK living with pets?</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ pet_friendly: !data.pet_friendly })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              data.pet_friendly ? 'bg-brand-600' : 'bg-slate-200'
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
              data.pet_friendly ? 'left-6' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-brand-300 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
