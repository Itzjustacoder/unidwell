'use client'

import { UK_UNIVERSITIES, type OnboardingData, type Gender } from '@/types'

interface Props {
  data: OnboardingData['step1']
  onChange: (vals: Partial<OnboardingData['step1']>) => void
  onNext: () => void
}

const genders: { value: Gender; label: string }[] = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'non_binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function Step1BasicInfo({ data, onChange, onNext }: Props) {
  const canProceed = data.name.trim().length >= 2 && data.university && data.year_of_study

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Tell us about yourself</h2>
        <p className="text-slate-400 text-sm">This is what other students will see on your profile.</p>
      </div>

      <div className="space-y-5 flex-1">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            First Name *
          </label>
          <input
            type="text"
            placeholder="Your first name"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white transition-colors"
            maxLength={50}
          />
        </div>

        {/* Age */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Age
          </label>
          <input
            type="number"
            placeholder="18"
            value={data.age}
            onChange={e => onChange({ age: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white transition-colors"
            min={16}
            max={99}
          />
        </div>

        {/* University */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            University *
          </label>
          <select
            value={data.university}
            onChange={e => onChange({ university: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white transition-colors appearance-none"
          >
            <option value="">Select your university</option>
            {UK_UNIVERSITIES.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Year of Study *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(y => (
              <button
                key={y}
                type="button"
                onClick={() => onChange({ year_of_study: String(y) })}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  data.year_of_study === String(y)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-brand-200'
                }`}
              >
                {y <= 5 ? `Y${y}` : y === 6 ? 'PG' : y === 7 ? 'PhD' : 'Etc'}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-2">
            {genders.map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => onChange({ gender: g.value })}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  data.gender === g.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-brand-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Bio <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            placeholder="Tell future housemates a bit about yourself…"
            value={data.bio}
            onChange={e => onChange({ bio: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white transition-colors resize-none"
            rows={3}
            maxLength={280}
          />
          <div className="text-right text-xs text-slate-300 mt-1">{data.bio.length}/280</div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full mt-6 bg-gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Continue →
      </button>
    </div>
  )
}
