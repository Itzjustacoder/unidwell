'use client'

import { X, SlidersHorizontal } from 'lucide-react'
import { UK_UNIVERSITIES } from '@/types'

export interface FilterState {
  university: string
  budgetMax: number
  sleepSchedule: string
  groupSize: number | null
  socialPref: string
}

interface Props {
  filters: FilterState
  onChange: (f: Partial<FilterState>) => void
  onReset: () => void
  open: boolean
  onClose: () => void
}

export default function FilterPanel({ filters, onChange, onReset, open, onClose }: Props) {
  const hasActive = filters.university || filters.sleepSchedule || filters.socialPref || filters.groupSize || filters.budgetMax < 3000

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
        open ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between py-3 mb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-brand-600" />
              <h2 className="font-bold text-slate-800 text-lg">Filters</h2>
              {hasActive && (
                <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* University */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                University
              </label>
              <select
                value={filters.university}
                onChange={e => onChange({ university: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm bg-white"
              >
                <option value="">All universities</option>
                {UK_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Max Budget: <span className="text-brand-600 normal-case">£{filters.budgetMax}/mo</span>
              </label>
              <input
                type="range"
                min={200}
                max={3000}
                step={50}
                value={filters.budgetMax}
                onChange={e => onChange({ budgetMax: parseInt(e.target.value) })}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>£200</span>
                <span>£3,000</span>
              </div>
            </div>

            {/* Sleep schedule */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Sleep Schedule
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: '', l: 'Any' },
                  { v: 'early_bird', l: '🌅 Early bird' },
                  { v: 'night_owl', l: '🌙 Night owl' },
                ].map(o => (
                  <button
                    key={o.v}
                    onClick={() => onChange({ sleepSchedule: o.v })}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      filters.sleepSchedule === o.v
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-100 text-slate-500 hover:border-brand-200'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Social preference */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Social Preference
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: '', l: 'Any' },
                  { v: 'social', l: 'Social' },
                  { v: 'balanced', l: 'Balanced' },
                  { v: 'private', l: 'Private' },
                ].map(o => (
                  <button
                    key={o.v}
                    onClick={() => onChange({ socialPref: o.v })}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      filters.socialPref === o.v
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-100 text-slate-500 hover:border-brand-200'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Group size */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Group Size
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[null, 2, 3, 4, 5].map(n => (
                  <button
                    key={String(n)}
                    onClick={() => onChange({ groupSize: n })}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      filters.groupSize === n
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-100 text-slate-500 hover:border-brand-200'
                    }`}
                  >
                    {n === null ? 'Any' : n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onReset}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 transition-colors text-sm"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-[2] py-3 rounded-2xl bg-gradient-brand text-white font-bold hover:opacity-90 transition-opacity text-sm"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
