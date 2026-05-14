'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, X, Check, Clock, Users, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, timeAgo } from '@/lib/utils'
import CompatibilityBadge from '@/components/explore/CompatibilityBadge'
import type { Match, Profile } from '@/types'

interface MatchWithProfile extends Match {
  other: Profile
}

export default function MatchesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [incoming, setIncoming] = useState<MatchWithProfile[]>([])
  const [sent, setSent] = useState<MatchWithProfile[]>([])
  const [accepted, setAccepted] = useState<MatchWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'accepted' | 'incoming' | 'sent'>('accepted')

  // Group creation state
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [creatingGroup, setCreatingGroup] = useState(false)

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
            .from('profiles').select('*').eq('id', otherId).single()
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
    const move = incoming.find(m => m.id === matchId)!
    if (status === 'accepted') setAccepted(a => [{ ...move, status: 'accepted' }, ...a])
    setIncoming(i => i.filter(m => m.id !== matchId))
  }

  function toggleSelect(matchId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(matchId) ? next.delete(matchId) : next.add(matchId)
      return next
    })
  }

  async function createGroup() {
    if (!userId || selected.size < 2) return
    setCreatingGroup(true)

    const selectedMatches = accepted.filter(m => selected.has(m.id))
    const names = selectedMatches.map(m => m.other.name.split(' ')[0]).join(', ')

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name: `${names} & you`, created_by: userId })
      .select().single()

    if (error || !group) { setCreatingGroup(false); return }

    const memberIds = [userId, ...selectedMatches.map(m => m.other.id)]
    await supabase.from('group_members').insert(
      memberIds.map(pid => ({ group_id: group.id, profile_id: pid }))
    )

    setCreatingGroup(false)
    setSelecting(false)
    setSelected(new Set())
    router.push(`/chat/group/${group.id}`)
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-slate-900">Matches</h1>
          {tab === 'accepted' && accepted.length >= 2 && (
            <button
              onClick={() => { setSelecting(s => !s); setSelected(new Set()) }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                selecting
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              <Users size={13} />
              {selecting ? 'Cancel' : 'Group chat'}
            </button>
          )}
        </div>

        <div className="flex gap-0">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelecting(false); setSelected(new Set()) }}
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

      {/* Group creation banner */}
      {selecting && (
        <div className="mx-4 mt-4 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">
              {selected.size === 0
                ? 'Select 2+ matches to create a group chat'
                : `${selected.size} selected`}
            </p>
            <p className="text-xs text-brand-500 mt-0.5">You + everyone selected can chat together</p>
          </div>
          <button
            onClick={createGroup}
            disabled={selected.size < 2 || creatingGroup}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {creatingGroup ? <Loader2 size={13} className="animate-spin" /> : <Users size={13} />}
            Create
          </button>
        </div>
      )}

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
                ? "When someone requests to chat, they'll show up here."
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
                selectable={selecting && tab === 'accepted'}
                selected={selected.has(m.id)}
                onSelect={() => toggleSelect(m.id)}
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
  match, isIncoming, selectable, selected, onSelect, onAccept, onReject,
}: {
  match: MatchWithProfile
  isIncoming: boolean
  selectable: boolean
  selected: boolean
  onSelect: () => void
  onAccept: () => void
  onReject: () => void
}) {
  const { other, status, compatibility_score, created_at } = match
  const avatar = other.avatar_url ?? getAvatarUrl(other.name, other.id)

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={`bg-white rounded-2xl p-4 shadow-card border flex items-center gap-3 transition-all ${
        selectable ? 'cursor-pointer' : ''
      } ${selected ? 'border-brand-400 bg-brand-50' : 'border-brand-50'}`}
    >
      {selectable && (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
        }`}>
          {selected && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
      )}

      <Link href={`/profile/${other.id}`} className="flex-shrink-0" onClick={e => selectable && e.preventDefault()}>
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

      {!selectable && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {isIncoming ? (
            <>
              <button onClick={onReject} className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                <X size={16} />
              </button>
              <button onClick={onAccept} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                <Check size={16} />
              </button>
            </>
          ) : status === 'accepted' ? (
            <Link href={`/chat/${match.id}`} className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90">
              <MessageCircle size={13} />
              Chat
            </Link>
          ) : (
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">Pending</span>
          )}
        </div>
      )}
    </div>
  )
}
