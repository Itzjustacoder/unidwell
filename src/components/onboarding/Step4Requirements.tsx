'use client'

import type { OnboardingData, HousingDuration } from '@/types'

interface Props {
  data: OnboardingData['step4']
  onChange: (vals: Partial<OnboardingData['step4']>) => void
  onBack: () => void
  onNext: () => void
}

const LONDON_AREAS = [
  'Zones 1-2', 'Zone 3', 'East London', 'South London', 'North London',
  'West London', 'Shoreditch', 'Hackney', 'Brixton', 'Camden',
  'Islington', 'Stratford', 'Peckham',
]

const DURATIONS: { value: HousingDuration; label: string; desc: string }[] = [
  { value: 'short_term',    label: 'Short term',    desc: 'Under 6 months' },
  { value: 'academic_year', label: 'Academic year', desc: 'Sep–Jun / Jul' },
  { value: 'long_term',     label: 'Long term',     desc: '12+ months' },
  { value: 'flexible',      label: 'Flexible',      desc: 'Open to anything' },
]

export default function Step4Requirements({ data, onChange, onBack, onNext }: Props) {
  function toggleArea(area: string) {
    const has = data.preferred_areas.includes(area)
    onChange({ preferred_areas: has ? data.preferred_areas.filter(a => a !== area) : [...data.preferred_areas, area] })
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Housing requirements</h2>
        <p className="text-slate-400 text-sm">Help us find roommates with matching expectations.</p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide pb-2">
        {/* Budget slider */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
            Monthly Budget Range
          </label>
          <div className="text-center mb-4">
            <span className="text-2xl font-extrabold text-brand-700">
              £{data.budget_min}
            </span>
            <span className="text-slate-400 mx-2">–</span>
            <span className="text-2xl font-extrabold text-brand-700">
              £{data.budget_max}
            </span>
            <span className="text-slate-400 text-sm">/mo</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Min: £{data.budget_min}</span>
              </div>
              <input
                type="range"
                min={200}
                max={data.budget_max - 50}
                step={50}
                value={data.budget_min}
                onChange={e => onChange({ budget_min: parseInt(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Max: £{data.budget_max}</span>
              </div>
              <input
                type="range"
                min={data.budget_min + 50}
                max={3000}
                step={50}
                value={data.budget_max}
                onChange={e => onChange({ budget_max: parseInt(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
          </div>
        </div>

        {/* Group size */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
            Group Size (incl. yourself)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ group_size: n })}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  data.group_size === n
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-brand-200'
                }`}
              >
                {n === 5 ? '5+' : n}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {data.group_size === 2 ? '1-on-1 roommate' : `House share of ${data.group_size}`}
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
            Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => onChange({ duration: d.value })}
                className={`py-3 px-3 rounded-xl border-2 text-left transition-all ${
                  data.duration === d.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-100 bg-white hover:border-brand-200'
                }`}
              >
                <div className={`text-xs font-bold ${data.duration === d.value ? 'text-brand-700' : 'text-slate-700'}`}>
                  {d.label}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred areas */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
            Preferred Areas <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LONDON_AREAS.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${
                  data.preferred_areas.includes(area)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Move-in date */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Ideal Move-in Date <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="date"
            value={data.move_in_date}
            onChange={e => onChange({ move_in_date: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
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
