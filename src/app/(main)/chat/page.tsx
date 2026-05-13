'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, timeAgo } from '@/lib/utils'
import type { Match, Profile, Message } from '@/types'

interface ConversationPreview extends Match {
  other: Profile
  lastMessage: Message | null
  unread: number
}

export default function ChatListPage() {
  const supabase = createClient()
  const [convos, setConvos] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (!matches) { setLoading(false); return }

      const previews = await Promise.all(
        matches.map(async (m) => {
          const otherId = m.requester_id === user.id ? m.receiver_id : m.requester_id

          const [{ data: other }, { data: msgs }, { count }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', otherId).single(),
            supabase.from('messages').select('*').eq('match_id', m.id)
              .order('created_at', { ascending: false }).limit(1),
            supabase.from('messages').select('*', { count: 'exact', head: true })
              .eq('match_id', m.id).eq('is_read', false).neq('sender_id', user.id),
          ])

          return {
            ...m,
            other: other!,
            lastMessage: msgs?.[0] ?? null,
            unread: count ?? 0,
          }
        }),
      )

      setConvos(previews)
      setLoading(false)
    }
    load()
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 border-b border-brand-50">
        <h1 className="text-xl font-extrabold text-slate-900">Messages</h1>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
          </div>
        ) : convos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">No conversations yet</h3>
            <p className="text-slate-400 text-sm mb-6">Accept a match request to start chatting.</p>
            <Link href="/matches" className="text-brand-600 font-semibold text-sm hover:underline">
              View match requests
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {convos.map(c => {
              const avatar = c.other.avatar_url ?? getAvatarUrl(c.other.name, c.other.id)
              return (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card border border-brand-50 hover:shadow-card-lg transition-all group"
                >
                  <div className="relative flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar} alt={c.other.name} width={36} height={36} className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-100" style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }} onError={e => { if (!e.currentTarget.src.startsWith('data:')) e.currentTarget.src = getAvatarUrl(c.other.name, c.other.id) }} />
                    {c.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-bold text-sm ${c.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {c.other.name}
                      </span>
                      {c.lastMessage && (
                        <span className="text-xs text-slate-300">{timeAgo(c.lastMessage.created_at)}</span>
                      )}
                    </div>
                    <div className={`text-xs truncate ${c.unread > 0 ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      {c.lastMessage ? c.lastMessage.content : 'Say hello! 👋'}
                    </div>
                  </div>

                  <MessageCircle size={16} className="text-slate-200 group-hover:text-brand-300 transition-colors flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
