'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, X, Home, CheckCircle2, MapPin, BedDouble, PoundSterling } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { FlatListing } from '@/types'

const MOCK_LISTINGS: FlatListing[] = [
  { id: '1', title: 'Modern 2-bed in Shoreditch', area: 'Shoreditch', price: 1800, bedrooms: 2, image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80', description: 'Bright, modern flat with exposed brick. 5 min walk to Old Street station.', available_from: '2025-09-01' },
  { id: '2', title: 'Cosy 3-bed in Hackney', area: 'Hackney', price: 2100, bedrooms: 3, image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', description: 'Victorian terrace with garden. Close to London Fields and Broadway Market.', available_from: '2025-08-15' },
  { id: '3', title: 'Studio suite in Camden', area: 'Camden', price: 950, bedrooms: 1, image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', description: 'Newly refurbished. All bills included. Vibrant area with great transport links.', available_from: '2025-07-01' },
  { id: '4', title: 'Spacious 2-bed in Brixton', area: 'Brixton', price: 1600, bedrooms: 2, image_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80', description: 'High ceilings, open plan kitchen. 2 min walk to Brixton tube.', available_from: '2025-09-15' },
  { id: '5', title: 'Penthouse 2-bed, Stratford', area: 'Stratford', price: 2000, bedrooms: 2, image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', description: 'Rooftop terrace, gym and concierge. 10 min to Canary Wharf.', available_from: '2025-10-01' },
  { id: '6', title: 'Charming 3-bed, Peckham', area: 'Peckham', price: 2400, bedrooms: 3, image_url: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600&q=80', description: 'Period property with original features. Huge kitchen-diner, close to Peckham Rye park.', available_from: '2025-08-01' },
  { id: '7', title: 'Zone 2 double room, Islington', area: 'Islington', price: 1200, bedrooms: 1, image_url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=600&q=80', description: 'En-suite room in a shared 4-bed house. Friendly housemates already in place.', available_from: '2025-07-15' },
  { id: '8', title: 'New build 2-bed, East London', area: 'East London', price: 1900, bedrooms: 2, image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&q=80', description: 'Part of a new development. Balcony, dishwasher, underfloor heating throughout.', available_from: '2025-09-01' },
]

export default function FlatsPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [otherId, setOtherId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('')
  const [index, setIndex] = useState(0)
  const [mySwipes, setMySwipes] = useState<Record<string, 'like' | 'pass'>>({})
  const [theirSwipes, setTheirSwipes] = useState<Record<string, 'like' | 'pass'>>({})
  const [showMatches, setShowMatches] = useState(false)
  const [swiping, setSwiping] = useState(false)

  const loadSwipes = useCallback(async (uid: string, oid: string) => {
    const { data } = await supabase
      .from('flat_swipes').select('*').eq('match_id', matchId)
    if (!data) return
    const mine: Record<string, 'like' | 'pass'> = {}
    const theirs: Record<string, 'like' | 'pass'> = {}
    data.forEach(s => {
      if (s.profile_id === uid) mine[s.flat_id] = s.direction
      else if (s.profile_id === oid) theirs[s.flat_id] = s.direction
    })
    setMySwipes(mine)
    setTheirSwipes(theirs)
  }, [matchId])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: match } = await supabase
        .from('matches').select('*').eq('id', matchId)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted').single()
      if (!match) { router.push('/chat'); return }

      const oid = match.requester_id === user.id ? match.receiver_id : match.requester_id
      setOtherId(oid)

      const { data: other } = await supabase.from('profiles').select('name').eq('id', oid).single()
      setOtherName(other?.name ?? 'your match')

      await loadSwipes(user.id, oid)

      // Seed mock listings into DB if not present
      const { count } = await supabase
        .from('flat_listings').select('*', { count: 'exact', head: true })
      if (!count || count === 0) {
        await supabase.from('flat_listings').insert(
          MOCK_LISTINGS.map(l => ({
            id: l.id, title: l.title, area: l.area, price: l.price,
            bedrooms: l.bedrooms, image_url: l.image_url,
            description: l.description, available_from: l.available_from,
          }))
        )
      }
    }
    init()
  }, [matchId, loadSwipes])

  // Realtime: watch for partner's swipes
  useEffect(() => {
    if (!userId || !otherId) return
    const channel = supabase
      .channel(`flat-swipes:${matchId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flat_swipes', filter: `match_id=eq.${matchId}` },
        () => loadSwipes(userId, otherId)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, otherId, matchId, loadSwipes])

  async function swipe(direction: 'like' | 'pass') {
    if (!userId || swiping) return
    const flat = MOCK_LISTINGS[index]
    setSwiping(true)
    setMySwipes(prev => ({ ...prev, [flat.id]: direction }))

    await supabase.from('flat_swipes').upsert({
      flat_id: flat.id, profile_id: userId, match_id: matchId, direction,
    })

    setSwiping(false)
    if (index < MOCK_LISTINGS.length - 1) setIndex(i => i + 1)
  }

  const mutualLikes = MOCK_LISTINGS.filter(
    l => mySwipes[l.id] === 'like' && theirSwipes[l.id] === 'like'
  )
  const done = index >= MOCK_LISTINGS.length || Object.keys(mySwipes).length >= MOCK_LISTINGS.length
  const flat = MOCK_LISTINGS[index]

  return (
    <div className="fixed inset-0 flex flex-col bg-brand-50">
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-brand-50 px-4 pt-safe-top pb-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-slate-600 hover:bg-brand-100 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 text-sm">Browse Flats Together</div>
              <div className="text-xs text-slate-400">with {otherName}</div>
            </div>
            <button
              onClick={() => setShowMatches(s => !s)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                showMatches ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'
              }`}
            >
              <Home size={13} />
              Matches {mutualLikes.length > 0 && `(${mutualLikes.length})`}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showMatches ? (
            <div className="p-4 space-y-3">
              <h2 className="text-base font-extrabold text-slate-800">
                {mutualLikes.length === 0
                  ? 'No mutual likes yet'
                  : `You both liked ${mutualLikes.length} flat${mutualLikes.length > 1 ? 's' : ''} 🎉`}
              </h2>
              {mutualLikes.map(l => (
                <div key={l.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-brand-50">
                  <img src={l.image_url} alt={l.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{l.title}</h3>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
                        <CheckCircle2 size={12} />
                        Mutual
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={11} />{l.area}</span>
                      <span className="flex items-center gap-1"><BedDouble size={11} />{l.bedrooms} bed</span>
                      <span className="flex items-center gap-1"><PoundSterling size={11} />{l.price}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : done ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">All caught up!</h3>
              <p className="text-slate-400 text-sm mb-4">You've reviewed all listings. Check your mutual matches.</p>
              <button
                onClick={() => setShowMatches(true)}
                className="bg-gradient-brand text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
              >
                See mutual matches ({mutualLikes.length})
              </button>
            </div>
          ) : (
            <div className="p-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>{index + 1} of {MOCK_LISTINGS.length}</span>
                <span className="flex items-center gap-1">
                  <Heart size={11} className="text-rose-400" />
                  {Object.values(mySwipes).filter(d => d === 'like').length} liked
                </span>
              </div>

              {/* Card */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-card-lg border border-brand-50">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flat.image_url} alt={flat.title} className="w-full h-56 object-cover" />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {mySwipes[flat.id] === 'like' && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">You liked</span>
                    )}
                    {theirSwipes[flat.id] === 'like' && (
                      <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{otherName.split(' ')[0]} liked</span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="font-extrabold text-slate-900 text-lg mb-1">{flat.title}</h2>
                  <div className="flex items-center gap-4 mb-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 font-semibold"><MapPin size={14} className="text-brand-400" />{flat.area}</span>
                    <span className="flex items-center gap-1.5 font-semibold"><BedDouble size={14} className="text-brand-400" />{flat.bedrooms} bed</span>
                    <span className="flex items-center gap-1.5 font-bold text-brand-700"><PoundSterling size={14} />{flat.price}/mo</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{flat.description}</p>
                  <p className="text-xs text-slate-400 mt-3">Available from {new Date(flat.available_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Swipe buttons */}
              <div className="flex gap-4 mt-6 justify-center">
                <button
                  onClick={() => swipe('pass')}
                  disabled={swiping}
                  className="w-16 h-16 rounded-full bg-white shadow-card-lg border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-rose-300 hover:text-rose-500 transition-all disabled:opacity-40"
                >
                  <X size={28} />
                </button>
                <button
                  onClick={() => swipe('like')}
                  disabled={swiping}
                  className="w-16 h-16 rounded-full bg-gradient-brand shadow-glow flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-40"
                >
                  <Heart size={28} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
