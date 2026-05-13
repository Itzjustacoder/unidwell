'use client'

import { useState, useEffect, useCallback } from 'react'
import { SlidersHorizontal, Search, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { computeCompatibilityScore } from '@/lib/compatibility'
import RoommateCard from '@/components/explore/RoommateCard'
import FilterPanel, { type FilterState } from '@/components/explore/FilterPanel'
import type { FullProfile } from '@/types'

const DEFAULT_FILTERS: FilterState = {
  university: '',
  budgetMax: 3000,
  sleepSchedule: '',
  groupSize: null,
  socialPref: '',
}

export default function ExplorePage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<FullProfile[]>([])
  const [myProfile, setMyProfile] = useState<FullProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [search, setSearch] = useState('')
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load current user's full profile
    const [myP, myL, myI, myH] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('lifestyle_preferences').select('*').eq('profile_id', user.id).single(),
      supabase.from('user_interests').select('*').eq('profile_id', user.id).single(),
      supabase.from('housing_requirements').select('*').eq('profile_id', user.id).single(),
    ])

    const me: FullProfile = {
      profile:    myP.data!,
      lifestyle:  myL.data,
      interests:  myI.data,
      housing:    myH.data,
    }
    setMyProfile(me)

    // Load all other profiles with their data
    const { data: otherProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('onboarding_complete', true)
      .neq('id', user.id)

    if (!otherProfiles) { setLoading(false); return }

    const fullProfiles = await Promise.all(
      otherProfiles.map(async (p) => {
        const [lRes, iRes, hRes] = await Promise.all([
          supabase.from('lifestyle_preferences').select('*').eq('profile_id', p.id).single(),
          supabase.from('user_interests').select('*').eq('profile_id', p.id).single(),
          supabase.from('housing_requirements').select('*').eq('profile_id', p.id).single(),
        ])

        const fp: FullProfile = {
          profile:   p,
          lifestyle: lRes.data,
          interests: iRes.data,
          housing:   hRes.data,
        }

        fp.compatibility_score = computeCompatibilityScore(
          { lifestyle: me.lifestyle, interests: me.interests, housing: me.housing },
          { lifestyle: fp.lifestyle, interests: fp.interests, housing: fp.housing },
        )

        return fp
      }),
    )

    // Sort by compatibility score
    fullProfiles.sort((a, b) => (b.compatibility_score ?? 0) - (a.compatibility_score ?? 0))
    setProfiles(fullProfiles)

    // Load existing match requests
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('receiver_id')
      .eq('requester_id', user.id)

    if (existingMatches) {
      setRequestedIds(new Set(existingMatches.map(m => m.receiver_id)))
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleRequestChat(profileId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !myProfile) return

    const score = profiles.find(p => p.profile.id === profileId)?.compatibility_score

    const { error } = await supabase.from('matches').insert({
      requester_id: user.id,
      receiver_id: profileId,
      compatibility_score: score ?? null,
    })

    if (!error) {
      setRequestedIds(prev => new Set([...Array.from(prev), profileId]))
    }
  }

  const filtered = profiles.filter(fp => {
    const p = fp.profile
    const l = fp.lifestyle
    const h = fp.housing

    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.university.toLowerCase().includes(search.toLowerCase())) return false

    if (filters.university && p.university !== filters.university) return false
    if (l?.sleep_schedule && filters.sleepSchedule && l.sleep_schedule !== filters.sleepSchedule) return false
    if (l?.social_preference && filters.socialPref && l.social_preference !== filters.socialPref) return false
    if (h && h.budget_min > filters.budgetMax) return false
    if (filters.groupSize && h?.group_size !== filters.groupSize) return false

    return true
  })

  const activeFilters = Object.entries(filters).filter(([k, v]) =>
    k === 'budgetMax' ? v < 3000 : Boolean(v),
  ).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 px-4 pt-12 pb-3 border-b border-brand-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Explore</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} students near you`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 hover:bg-brand-100 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilters > 0
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilters > 0 && (
                <span className="bg-white text-brand-700 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or university…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-brand-50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-brand-50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">No matches found</h3>
            <p className="text-slate-400 text-sm mb-6">
              Try adjusting your filters or check back later.
            </p>
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setSearch('') }}
              className="text-brand-600 font-semibold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(fp => (
              <RoommateCard
                key={fp.profile.id}
                fullProfile={fp}
                onRequestChat={handleRequestChat}
                alreadyRequested={requestedIds.has(fp.profile.id)}
              />
            ))}
          </div>
        )}
      </div>

      <FilterPanel
        filters={filters}
        onChange={vals => setFilters(f => ({ ...f, ...vals }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  )
}
