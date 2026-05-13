'use client'

import { useState, ChangeEvent } from 'react'
import Link from 'next/link'
import {
  GraduationCap, MapPin, Moon, Sun, Users, Cigarette,
  Volume2, Dog, Calendar, DollarSign, MessageCircle,
  Shield, Edit, Camera, Loader2
} from 'lucide-react'
import { getAvatarUrl, formatBudget, yearLabel, genderLabel } from '@/lib/utils'
import CompatibilityBadge from '@/components/explore/CompatibilityBadge'
import type { FullProfile } from '@/types'
import { createBrowserClient } from '@supabase/ssr'

const SLEEP_ICONS: Record<string, React.ReactNode> = {
  early_bird: <Sun size={14} className="text-amber-500" />,
  night_owl:  <Moon size={14} className="text-indigo-500" />,
  flexible:   <span className="text-sm">✨</span>,
}

const TAG_EMOJIS: Record<string, string> = {
  Gaming: '🎮', Sports: '⚽', Cooking: '🍳', Reading: '📚', Music: '🎵',
  'Art & Design': '🎨', 'Film & TV': '🎬', Travel: '✈️', 'Gym & Fitness': '💪',
  Yoga: '🧘', Photography: '📸', Dancing: '💃', Coding: '💻', Fashion: '👗',
  Foodie: '🍜', 'Nature & Hiking': '🏔️', Volunteering: '🤝', Chess: '♟️',
  Podcasts: '🎙️', 'Coffee Lover': '☕',
}

interface Props {
  fullProfile: FullProfile
  isOwn?: boolean
  onRequestChat?: () => void
  alreadyRequested?: boolean
}

export default function ProfileView({ fullProfile, isOwn, onRequestChat, alreadyRequested }: Props) {
  const supabase = createBrowserClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { profile, lifestyle, interests, housing, compatibility_score } = fullProfile
  
  // State to manage the UI during and after upload
  const [uploading, setUploading] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(profile.avatar_url ?? getAvatarUrl(profile.name, profile.id))

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      // Use the profile ID to keep the bucket organized
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('Avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('Avatars')
        .getPublicUrl(filePath)

      // 3. Update the database record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      // 4. Update the local state so the image changes instantly
      setCurrentAvatar(publicUrl)
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message)
      alert('Failed to upload image. Check console for details.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero header */}
      <div className="relative bg-gradient-brand pt-16 pb-20 px-5">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 70%)' }} />

        {/* Avatar Section */}
        <div className="flex flex-col items-center relative z-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-white/30 shadow-xl mb-4 bg-slate-100">
              {/* Using standard img to avoid Next.js Image Optimization 400 errors */}
              <img 
                src={currentAvatar} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
                onError={e => { 
                  if (!e.currentTarget.src.startsWith('data:')) 
                    e.currentTarget.src = getAvatarUrl(profile.name, profile.id) 
                }} 
              />
              
              {/* Overlay for uploading - only visible to the owner */}
              {isOwn && (
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                  {uploading ? (
                    <Loader2 className="text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="text-white mb-1" size={20} />
                      <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Change</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleUpload} 
                    disabled={uploading} 
                  />
                </label>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-white text-center">
            {profile.name}
            {profile.age && <span className="font-normal text-white/70">, {profile.age}</span>}
          </h1>

          <div className="flex items-center gap-1.5 mt-1.5 text-white/70 text-sm">
            <GraduationCap size={14} />
            <span>{profile.university}</span>
            {profile.year_of_study && (
              <>
                <span>·</span>
                <span>{yearLabel(profile.year_of_study)}</span>
              </>
            )}
          </div>

          {profile.gender && (
            <span className="mt-2 text-xs text-white/50">{genderLabel(profile.gender)}</span>
          )}

          {profile.is_verified && (
            <div className="flex items-center gap-1 mt-3 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
              <Shield size={12} />
              Verified Student
            </div>
          )}
        </div>
      </div>

      {/* Rest of the component (Action card, Bio, Lifestyle, etc.) remains unchanged */}
      <div className="px-4 -mt-12 relative z-10 pb-8 space-y-4">
        <div className="bg-white rounded-2xl shadow-card-lg p-4 flex items-center justify-between">
          {compatibility_score !== undefined ? (
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">Compatibility</div>
              <CompatibilityBadge score={compatibility_score} size="lg" showLabel />
            </div>
          ) : (
            <div />
          )}

          {isOwn ? (
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 bg-brand-50 text-brand-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-100 transition-colors"
            >
              <Edit size={15} />
              Edit profile
            </Link>
          ) : (
            <button
              onClick={onRequestChat}
              disabled={alreadyRequested}
              className={`flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl transition-all ${
                alreadyRequested
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-brand text-white hover:opacity-90 hover:shadow-glow'
              }`}
            >
              <MessageCircle size={15} />
              {alreadyRequested ? 'Requested' : 'Request chat'}
            </button>
          )}
        </div>

        {profile.bio && (
          <Section title="About">
            <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
          </Section>
        )}

        {lifestyle && (
          <Section title="Lifestyle">
            <div className="grid grid-cols-2 gap-2">
              <StatItem
                icon={SLEEP_ICONS[lifestyle.sleep_schedule]}
                label="Sleep"
                value={lifestyle.sleep_schedule.replace('_', ' ')}
              />
              <StatItem
                icon={<span className="text-sm">🧹</span>}
                label="Cleanliness"
                value={`${lifestyle.cleanliness_level}/5`}
                valueClass={lifestyle.cleanliness_level >= 4 ? 'text-emerald-600' : ''}
              />
              <StatItem
                icon={<Users size={14} className="text-brand-400" />}
                label="Social"
                value={lifestyle.social_preference}
              />
              <StatItem
                icon={<Volume2 size={14} className="text-slate-400" />}
                label="Noise"
                value={lifestyle.noise_tolerance}
              />
              <StatItem
                icon={<Cigarette size={14} className={lifestyle.smoking === 'smoker' ? 'text-rose-400' : 'text-slate-400'} />}
                label="Smoking"
                value={lifestyle.smoking.replace('_', ' ')}
              />
              <StatItem
                icon={<Dog size={14} className={lifestyle.pet_friendly ? 'text-amber-500' : 'text-slate-300'} />}
                label="Pets"
                value={lifestyle.pet_friendly ? 'Welcome' : 'No pets'}
              />
            </div>
          </Section>
        )}

        {interests?.tags && interests.tags.length > 0 && (
          <Section title="Interests">
            <div className="flex flex-wrap gap-2">
              {interests.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-100 text-sm px-3 py-1.5 rounded-full font-medium">
                  {TAG_EMOJIS[tag]} {tag}
                </span>
              ))}
            </div>
          </Section>
        )}

        {housing && (
          <Section title="Looking for">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <DollarSign size={14} className="text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-700">{formatBudget(housing.budget_min, housing.budget_max)}</div>
                  <div className="text-xs text-slate-400">Monthly budget</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-700">
                    {housing.group_size === 2 ? '1-on-1 roommate' : `Group of ${housing.group_size}`}
                  </div>
                  <div className="text-xs text-slate-400">Group size</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-700 capitalize">{housing.duration.replace('_', ' ')}</div>
                  <div className="text-xs text-slate-400">Duration</div>
                </div>
              </div>

              {housing.preferred_areas.length > 0 && (
                <div className="flex items-start gap-2.5 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 mb-1">Preferred areas</div>
                    <div className="flex flex-wrap gap-1.5">
                      {housing.preferred_areas.map(a => (
                        <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  )
}

function StatItem({
  icon,
  label,
  value,
  valueClass = '',
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-2 bg-brand-50 rounded-xl p-2.5">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
        <div className={`text-xs font-semibold text-slate-700 capitalize truncate ${valueClass}`}>{value}</div>
      </div>
    </div>
  )
}