'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { computeCompatibilityScore } from '@/lib/compatibility'
import ProfileView from '@/components/profile/ProfileView'
import type { FullProfile } from '@/types'

export default function OtherProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [target, setTarget]             = useState<FullProfile | null>(null)
  const [loading, setLoading]           = useState(true)
  const [alreadyRequested, setAlready]  = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (user.id === id) { router.push('/profile'); return }

      const [
        { data: p },
        { data: l },
        { data: i },
        { data: h },
        { data: myL },
        { data: myI },
        { data: myH },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('lifestyle_preferences').select('*').eq('profile_id', id).single(),
        supabase.from('user_interests').select('*').eq('profile_id', id).single(),
        supabase.from('housing_requirements').select('*').eq('profile_id', id).single(),
        supabase.from('lifestyle_preferences').select('*').eq('profile_id', user.id).single(),
        supabase.from('user_interests').select('*').eq('profile_id', user.id).single(),
        supabase.from('housing_requirements').select('*').eq('profile_id', user.id).single(),
      ])

      if (!p) { router.push('/explore'); return }

      const score = computeCompatibilityScore(
        { lifestyle: myL, interests: myI, housing: myH },
        { lifestyle: l, interests: i, housing: h },
      )

      setTarget({ profile: p, lifestyle: l, interests: i, housing: h, compatibility_score: score })

      const { data: existing } = await supabase
        .from('matches')
        .select('id')
        .eq('requester_id', user.id)
        .eq('receiver_id', id)
        .maybeSingle()

      setAlready(!!existing)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleRequestChat() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !target) return

    await supabase.from('matches').insert({
      requester_id: user.id,
      receiver_id: id,
      compatibility_score: target.compatibility_score,
    })
    setAlready(true)
  }

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Back button overlay */}
      <div className="absolute top-0 left-0 z-20 p-4 pt-safe-top">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center text-slate-700 shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 p-4 pt-20">
          <div className="bg-brand-200 rounded-3xl h-48 animate-pulse" />
          <div className="bg-white rounded-2xl h-32 animate-pulse" />
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
        </div>
      ) : target ? (
        <ProfileView
          fullProfile={target}
          isOwn={false}
          onRequestChat={handleRequestChat}
          alreadyRequested={alreadyRequested}
        />
      ) : null}
    </div>
  )
}
