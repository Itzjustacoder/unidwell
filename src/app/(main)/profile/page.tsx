'use client'

import { useState, useEffect } from 'react'
import { LogOut, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProfileView from '@/components/profile/ProfileView'
import type { FullProfile } from '@/types'

export default function OwnProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: l }, { data: i }, { data: h }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('lifestyle_preferences').select('*').eq('profile_id', user.id).single(),
        supabase.from('user_interests').select('*').eq('profile_id', user.id).single(),
        supabase.from('housing_requirements').select('*').eq('profile_id', user.id).single(),
      ])

      setProfile({ profile: p!, lifestyle: l, interests: i, housing: h })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Top actions */}
      <div className="absolute top-0 right-0 z-20 p-4 pt-safe-top flex gap-2">
        <button
          onClick={handleSignOut}
          className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center text-slate-500 shadow-sm hover:bg-white transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 p-4 pt-20">
          <div className="bg-brand-200 rounded-3xl h-48 animate-pulse" />
          <div className="bg-white rounded-2xl h-32 animate-pulse" />
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
        </div>
      ) : profile ? (
        <ProfileView fullProfile={profile} isOwn />
      ) : null}
    </div>
  )
}
