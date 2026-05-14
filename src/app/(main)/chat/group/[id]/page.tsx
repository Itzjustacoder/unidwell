'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'
import type { GroupMessage, Profile } from '@/types'

interface MemberWithProfile {
  profile_id: string
  profile: Profile
}

export default function GroupChatPage() {
  const { id: groupId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId]     = useState<string | null>(null)
  const [groupName, setGroupName] = useState('')
  const [members, setMembers]   = useState<MemberWithProfile[]>([])
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const init = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const { data: group } = await supabase
      .from('groups').select('*').eq('id', groupId).single()
    if (!group) { router.push('/chat'); return }
    setGroupName(group.name)

    const { data: memberRows } = await supabase
      .from('group_members').select('profile_id').eq('group_id', groupId)

    if (memberRows) {
      const enriched = await Promise.all(
        memberRows.map(async (m) => {
          const { data: profile } = await supabase
            .from('profiles').select('*').eq('id', m.profile_id).single()
          return { profile_id: m.profile_id, profile: profile! }
        })
      )
      setMembers(enriched)
    }

    const { data: msgs } = await supabase
      .from('group_messages').select('*').eq('group_id', groupId)
      .order('created_at', { ascending: true })
    setMessages(msgs ?? [])
    setLoading(false)
  }, [groupId])

  useEffect(() => { init() }, [init])

  useEffect(() => {
    const channel = supabase
      .channel(`group:${groupId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => setMessages(prev => [...prev, payload.new as GroupMessage])
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !userId) return
    setInput('')
    setSending(true)
    await supabase.from('group_messages').insert({
      group_id:  groupId,
      sender_id: userId,
      content:   text,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  function senderName(senderId: string) {
    const m = members.find(m => m.profile_id === senderId)
    return m?.profile.name ?? 'Unknown'
  }
  function senderAvatar(senderId: string) {
    const m = members.find(m => m.profile_id === senderId)
    return m ? (m.profile.avatar_url ?? getAvatarUrl(m.profile.name, m.profile_id)) : ''
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-brand-50">
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-brand-50 px-4 pt-safe-top pb-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-slate-600 hover:bg-brand-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 text-sm leading-tight truncate">
                    {groupName || 'Group Chat'}
                  </div>
                  <div className="text-xs text-slate-400">{members.length} members</div>
                </div>
              </div>
            </div>
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
              <p className="text-slate-500 font-medium text-sm">Group created! Say hello to everyone.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender_id === userId
              const prevMsg = messages[i - 1]
              const sameAuthor = prevMsg?.sender_id === msg.sender_id
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameAuthor ? 'mt-0.5' : 'mt-3'}`}>
                  {!isMine && !sameAuthor && (
                    <img
                      src={senderAvatar(msg.sender_id)}
                      alt={senderName(msg.sender_id)}
                      width={28} height={28}
                      className="w-7 h-7 rounded-lg object-cover mr-2 flex-shrink-0 self-end"
                    />
                  )}
                  {!isMine && sameAuthor && <div className="w-7 mr-2 flex-shrink-0" />}
                  <div className="max-w-[75%]">
                    {!isMine && !sameAuthor && (
                      <div className="text-[10px] font-semibold text-slate-400 mb-0.5 ml-1">
                        {senderName(msg.sender_id)}
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? 'bg-gradient-brand text-white rounded-br-sm'
                        : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm'
                    }`}>
                      {msg.content}
                      <div className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 py-3 nav-safe-bottom">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Message the group…"
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
    </div>
  )
}
