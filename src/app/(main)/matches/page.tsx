'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, X, Check, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, timeAgo } from '@/lib/utils'
import CompatibilityBadge from '@/components/explore/CompatibilityBadge'
import type { Match, Profile } from '@/types'

interface MatchWithProfile extends Match {
  other: Profile
}

export default function MatchesPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [incoming, setIncoming] = useState<MatchWithProfile[]>([])
  const [sent, setSent] = useState<MatchWithProfile[]>([])
  const [accepted, setAccepted] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'accepted' | 'incoming' | 'sent'>('accepted')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (!matches) { setLoading(false); return }

      const enriched: MatchWithProfile[] = await Promise.all(
        matches.map(async (m) => {
          const otherId = m.requester_id === user.id ? m.receiver_id : m.requester_id
          const { data: other } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single()
          return { ...m, other: other! }
        }),
      )

      setAccepted(enriched.filter(m => m.status === 'accepted'))
      setIncoming(enriched.filter(m => m.status === 'pending' && m.receiver_id === user.id))
      setSent(enriched.filter(m => m.status === 'pending' && m.requester_id === user.id))
      setLoading(false)
    }
    load()
  }, [])

  async function respond(matchId: string, status: 'accepted' | 'rejected') {
    await supabase.from('matches').update({ status }).eq('id', matchId)
    // Reload
    const move = incoming.find(m => m.id === matchId)!
    if (status === 'accepted') {
      setAccepted(a => [{ ...move, status: 'accepted' }, ...a])
    }
    setIncoming(i => i.filter(m => m.id !== matchId))
  }

  const tabs = [
    { key: 'accepted' as const, label: 'Matched',  count: accepted.length,  icon: Heart },
    { key: 'incoming' as const, label: 'Requests', count: incoming.length,  icon: Clock },
    { key: 'sent'     as const, label: 'Sent',     count: sent.length,      icon: MessageCircle },
  ]

  const current = tab === 'accepted' ? accepted : tab === 'incoming' ? incoming : sent

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 px-4 pt-12 pb-0 border-b border-brand-50">
        <h1 className="text-xl font-extrabold text-slate-900 mb-4">Matches</h1>

        {/* Tabs */}
        <div className="flex gap-0">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 pb-3 text-sm font-semibold border-b-2 transition-all ${
                tab === key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={15} />
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === key ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
          </div>
        ) : current.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">
              {tab === 'accepted' ? '💜' : tab === 'incoming' ? '📬' : '📤'}
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">
              {tab === 'accepted' ? 'No matches yet' : tab === 'incoming' ? 'No requests' : 'Nothing sent'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {tab === 'accepted'
                ? 'Start exploring to find your roommate.'
                : tab === 'incoming'
                ? 'When someone requests to chat, they\'ll show up here.'
                : 'Request chat with someone from Explore!'}
            </p>
            <Link href="/explore" className="text-brand-600 font-semibold text-sm hover:underline">
              Go to Explore
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {current.map(m => (
              <MatchCard
                key={m.id}
                match={m}
                isIncoming={tab === 'incoming'}
                onAccept={() => respond(m.id, 'accepted')}
                onReject={() => respond(m.id, 'rejected')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MatchCard({
  match,
  isIncoming,
  onAccept,
  onReject,
}: {
  match: MatchWithProfile
  isIncoming: boolean
  onAccept: () => void
  onReject: () => void
}) {
  const { other, status, compatibility_score, created_at } = match
  const avatar = other.avatar_url ?? getAvatarUrl(other.name, other.id)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-brand-50 flex items-center gap-3">
      <Link href={`/profile/${other.id}`} className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={other.name} width={36} height={36} className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-100" style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }} onError={e => { if (!e.currentTarget.src.startsWith('data:')) e.currentTarget.src = getAvatarUrl(other.name, other.id) }} />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 text-sm">{other.name}</span>
          {compatibility_score != null && (
            <CompatibilityBadge score={compatibility_score} size="sm" />
          )}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 truncate">{other.university}</div>
        <div className="text-xs text-slate-300 mt-0.5">{timeAgo(created_at)}</div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isIncoming ? (
          <>
            <button
              onClick={onReject}
              className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
            >
              <X size={16} />
            </button>
            <button
              onClick={onAccept}
              className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
            >
              <Check size={16} />
            </button>
          </>
        ) : status === 'accepted' ? (
          <Link
            href={`/chat/${match.id}`}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90"
          >
            <MessageCircle size={13} />
            Chat
          </Link>
        ) : (
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">
            Pending
          </span>
        )}
      </div>
    </div>
  )
}
