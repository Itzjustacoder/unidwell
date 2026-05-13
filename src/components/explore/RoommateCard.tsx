'use client'

import Link from 'next/link'
import { MapPin, GraduationCap, MessageCircle, Moon, Sun, Users, Cigarette } from 'lucide-react'
import { getAvatarUrl, formatBudget, yearLabel } from '@/lib/utils'
import CompatibilityBadge from './CompatibilityBadge'
import type { FullProfile } from '@/types'

interface Props {
  fullProfile: FullProfile
  onRequestChat?: (profileId: string) => void
  alreadyRequested?: boolean
}

const SLEEP_ICONS: Record<string, React.ReactNode> = {
  early_bird: <Sun size={12} className="text-amber-500" />,
  night_owl:  <Moon size={12} className="text-indigo-500" />,
  flexible:   <span className="text-xs">✨</span>,
}

export default function RoommateCard({ fullProfile, onRequestChat, alreadyRequested }: Props) {
  const { profile, lifestyle, interests, housing, compatibility_score } = fullProfile
  const avatarUrl = profile.avatar_url ?? getAvatarUrl(profile.name, profile.id)
  const tags = interests?.tags?.slice(0, 4) ?? []

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-50 overflow-hidden hover:shadow-card-lg hover:-translate-y-0.5 transition-all group">
      {/* Header gradient */}
      <div className="h-1.5 bg-gradient-brand" />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <Link href={`/profile/${profile.id}`} className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-brand-100 group-hover:ring-brand-300 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" onError={e => { if (!e.currentTarget.src.startsWith('data:')) e.currentTarget.src = getAvatarUrl(profile.name, profile.id) }} />
            </div>
          </Link>

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/profile/${profile.id}`}>
                  <h3 className="font-bold text-slate-800 text-base leading-tight hover:text-brand-700 transition-colors">
                    {profile.name}
                    {profile.age ? <span className="text-slate-400 font-normal">, {profile.age}</span> : null}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                  <GraduationCap size={11} />
                  <span className="truncate">{profile.university}</span>
                  <span>·</span>
                  <span>{profile.year_of_study ? yearLabel(profile.year_of_study) : ''}</span>
                </div>
              </div>

              {compatibility_score !== undefined && (
                <CompatibilityBadge score={compatibility_score} size="sm" />
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Lifestyle chips */}
        {lifestyle && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Chip icon={SLEEP_ICONS[lifestyle.sleep_schedule]} label={lifestyle.sleep_schedule.replace('_', ' ')} />
            <Chip
              label={`Clean ${lifestyle.cleanliness_level}/5`}
              className={lifestyle.cleanliness_level >= 4 ? 'text-emerald-700 bg-emerald-50' : ''}
            />
            <Chip label={lifestyle.social_preference} />
            {lifestyle.smoking !== 'non_smoker' && (
              <Chip icon={<Cigarette size={11} className="text-rose-400" />} label={lifestyle.smoking.replace('_', ' ')} />
            )}
            {lifestyle.pet_friendly && <Chip label="🐾 Pet-friendly" />}
          </div>
        )}

        {/* Interest tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium border border-brand-100">
                {tag}
              </span>
            ))}
            {(interests?.tags?.length ?? 0) > 4 && (
              <span className="text-xs text-slate-400 font-medium px-1">
                +{(interests?.tags?.length ?? 0) - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {housing && (
              <>
                <span className="font-semibold text-slate-600">
                  {formatBudget(housing.budget_min, housing.budget_max)}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {housing.group_size === 2 ? '1-on-1' : `Group of ${housing.group_size}`}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => onRequestChat?.(profile.id)}
            disabled={alreadyRequested}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              alreadyRequested
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-brand text-white hover:opacity-90 hover:shadow-sm'
            }`}
          >
            <MessageCircle size={13} />
            {alreadyRequested ? 'Requested' : 'Request chat'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({
  label,
  icon,
  className = '',
}: {
  label: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full ${className}`}>
      {icon}
      {label}
    </span>
  )
}
