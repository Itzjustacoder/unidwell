'use client'

import { Globe, Languages, Heart, Loader2, AlertCircle } from 'lucide-react'
import type { OnboardingData } from '@/types'

interface Props {
  data: OnboardingData['step5']
  onChange: (vals: Partial<OnboardingData['step5']>) => void
  onNext: () => void
  onBack: () => void
  saving?: boolean
  error?: string
}

const LANGUAGES = [
  'English', 'Mandarin', 'Hindi', 'Spanish', 'French', 'Arabic',
  'Portuguese', 'Bengali', 'Russian', 'Urdu', 'Japanese', 'German',
  'Korean', 'Turkish', 'Italian', 'Polish', 'Punjabi', 'Cantonese',
  'Tagalog', 'Swahili',
]

const COUNTRIES = [
  'United Kingdom', 'United States', 'China', 'India', 'Nigeria',
  'Pakistan', 'Bangladesh', 'Germany', 'France', 'Italy', 'Spain',
  'Brazil', 'Canada', 'Australia', 'South Korea', 'Japan', 'Turkey',
  'Saudi Arabia', 'Egypt', 'South Africa', 'Kenya', 'Ghana',
  'Malaysia', 'Singapore', 'Hong Kong', 'Iran', 'Iraq', 'Greece',
  'Poland', 'Romania', 'Ukraine', 'Netherlands', 'Sweden', 'Norway',
  'Other',
]

export default function Step5Origin({ data, onChange, onNext, onBack, saving = false, error = '' }: Props) {
  function toggleLanguage(lang: string) {
    const has = data.languages.includes(lang)
    onChange({ languages: has ? data.languages.filter(l => l !== lang) : [...data.languages, lang] })
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Where are you from?</h2>
        <p className="text-slate-400 text-sm">Helps us find people you'll feel at home with.</p>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide pb-2">
        {/* Country */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-brand-500" />
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Country of Origin</label>
          </div>
          <select
            value={data.country}
            onChange={e => onChange({ country: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white transition-colors"
          >
            <option value="">Select your country…</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Languages */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Languages size={14} className="text-brand-500" />
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Languages you speak</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${
                  data.languages.includes(lang)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Match same origin preference */}
        <div className="bg-white border-2 border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-brand-500" />
              <div>
                <div className="text-sm font-semibold text-slate-700">Prefer similar background</div>
                <div className="text-xs text-slate-400">Prioritise matches from the same country or who speak the same language</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ match_same_origin: !data.match_same_origin })}
              className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${
                data.match_same_origin ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                data.match_same_origin ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 rounded-xl p-3 text-sm mt-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          disabled={saving}
          className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-brand-300 transition-colors disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={saving}
          className="flex-[2] bg-gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : '🎉 Find my roommate!'}
        </button>
      </div>
    </div>
  )
}
