'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'
import type { Message, Profile } from '@/types'

export default function ChatPage() {
  const { id: matchId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId]         = useState<string | null>(null)
  const [other, setOther]           = useState<Profile | null>(null)
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const [loading, setLoading]       = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // Verify match belongs to user and is accepted
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .single()

      if (!match) { router.push('/chat'); return }

      const otherId = match.requester_id === user.id ? match.receiver_id : match.requester_id

      const { data: otherProfile } = await supabase
        .from('profiles').select('*').eq('id', otherId).single()
      setOther(otherProfile)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
      setMessages(msgs ?? [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)

      setLoading(false)
    }
    init()
  }, [matchId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => [...prev, msg])
          // Mark as read if from other
          if (userId && msg.sender_id !== userId) {
            supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, userId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !userId) return

    setInput('')
    setSending(true)
    await supabase.from('messages').insert({
      match_id:  matchId,
      sender_id: userId,
      content:   text,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  const avatar = other ? (other.avatar_url ?? getAvatarUrl(other.name, other.id)) : ''

  return (
    <div className="flex flex-col h-screen bg-brand-50 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-brand-50 px-4 pt-safe-top pb-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-slate-600 hover:bg-brand-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {other ? (
            <Link href={`/profile/${other.id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt={other.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-100 flex-shrink-0" onError={e => { if (!e.currentTarget.src.startsWith('data:')) e.currentTarget.src = getAvatarUrl(other.name, other.id) }} />
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-sm leading-tight">{other.name}</div>
                <div className="text-xs text-slate-400 truncate">{other.university}</div>
              </div>
            </Link>
          ) : (
            <div className="flex-1 h-9 bg-slate-100 animate-pulse rounded-xl" />
          )}

          {other && (
            <Link href={`/profile/${other.id}`}
              className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-slate-500 hover:bg-brand-100 transition-colors flex-shrink-0">
              <Info size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <div className={`h-10 rounded-2xl animate-pulse ${i % 2 === 0 ? 'bg-brand-200 w-40' : 'bg-white w-52'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-5xl mb-4">👋</div>
            <p className="text-slate-500 font-medium text-sm">
              You matched! Send your first message.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Hey! When are you looking to move in?', 'What area are you thinking?', 'Seen any good places yet?'].map(t => (
                <button
                  key={t}
                  onClick={() => setInput(t)}
                  className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors font-medium"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === userId
              const prevMsg = messages[i - 1]
              const sameAuthor = prevMsg && prevMsg.sender_id === msg.sender_id
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameAuthor ? 'mt-0.5' : 'mt-3'}`}>
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-gradient-brand text-white rounded-br-sm'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                  }`}>
                    {msg.content}
                    <div className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMine && msg.is_read && ' · Read'}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 nav-safe-bottom">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-brand-50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 placeholder-slate-400"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
