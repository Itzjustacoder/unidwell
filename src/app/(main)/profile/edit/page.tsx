'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Loader2, Check, AlertCircle, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl } from '@/lib/utils'
import { UK_UNIVERSITIES, type Gender } from '@/types'

const AVATAR_BUCKET = 'Avatars'

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male',              label: 'Male'           },
  { value: 'female',            label: 'Female'         },
  { value: 'non_binary',        label: 'Non-binary'     },
  { value: 'prefer_not_to_say', label: 'Prefer not say' },
]

const YEARS = [
  { v: '1', l: 'Year 1' }, { v: '2', l: 'Year 2' }, { v: '3', l: 'Year 3' },
  { v: '4', l: 'Year 4' }, { v: '5', l: 'Year 5' }, { v: '6', l: 'Postgrad' },
  { v: '7', l: 'PhD' },    { v: '8', l: 'Other' },
]


export default function EditProfilePage() {
  const router   = useRouter()
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [userId,      setUserId]      = useState<string | null>(null)
  const [userEmail,   setUserEmail]   = useState('')
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')
  const [photoSaved,  setPhotoSaved]  = useState(false)
  const [avatarError, setAvatarError] = useState('')

  const [form, setForm] = useState({
    name:          '',
    age:           '',
    university:    '',
    year_of_study: '',
    gender:        '' as Gender | '',
    bio:           '',
    avatar_url:    null as string | null,
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      setUserEmail(user.email ?? '')

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (p) {
        setForm({
          name:          p.name          ?? '',
          age:           p.age           ? String(p.age) : '',
          university:    p.university    ?? '',
          year_of_study: p.year_of_study ? String(p.year_of_study) : '',
          gender:        p.gender        ?? '',
          bio:           p.bio           ?? '',
          avatar_url:    p.avatar_url,
        })
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) { setAvatarError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024)    { setAvatarError('Please choose an image under 5 MB'); return }

    setUploading(true)
    setAvatarError('')
    setPhotoSaved(false)

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(filePath)

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateErr) throw new Error(updateErr.message)

      setForm(f => ({ ...f, avatar_url: publicUrl }))

      setPhotoSaved(true)
      setTimeout(() => setPhotoSaved(false), 3000)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : String(err))

    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        id:            userId,
        email:         userEmail,
        name:          form.name,
        age:           parseInt(form.age) || null,
        university:    form.university,
        year_of_study: parseInt(form.year_of_study) || null,
        gender:        form.gender || null,
        bio:           form.bio,
        avatar_url:    form.avatar_url,
      }, { onConflict: 'id' })

    setSaving(false)
    if (err) { setError(err.message) }
    else     { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  const avatarSrc = form.avatar_url ?? getAvatarUrl(form.name || 'User', userId ?? '')

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-brand-50">

      {/* Header */}
      <div className="bg-white border-b border-brand-50 px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-30">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-slate-600 hover:bg-brand-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-extrabold text-slate-900 flex-1">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            saved
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-gradient-brand text-white hover:opacity-90 disabled:opacity-50'
          }`}
        >
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={14} /> Saved!</>
          ) : (
            'Save'
          )}
        </button>
      </div>

      <div className="px-4 py-6 space-y-4">

        {/* Avatar upload */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-50">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
            Profile Photo
          </label>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-brand-100 bg-brand-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={e => {
                    // Only fall back for broken https:// URLs, never for data: URLs
                    if (!e.currentTarget.src.startsWith('data:')) {
                      e.currentTarget.src = getAvatarUrl(form.name || 'User', userId ?? '')
                    }
                  }}
                />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              )}
              {photoSaved && (
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/80 flex items-center justify-center">
                  <Check size={24} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="flex-1">
              {photoSaved ? (
                <p className="text-sm font-semibold text-emerald-600 mb-3">✓ Photo saved!</p>
              ) : (
                <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                  Upload a photo so your matches can put a face to the name.
                </p>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-brand-50 text-brand-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-100 transition-colors disabled:opacity-50 border border-brand-200"
              >
                <Camera size={15} />
                {uploading ? 'Uploading…' : 'Choose photo'}
              </button>
              <p className="text-xs text-slate-300 mt-1.5">JPG, PNG, WEBP · max 5 MB</p>
              {avatarError && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">{avatarError}</p>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Name + Age */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-50">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-brand-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal</span>
          </div>
          <div className="flex gap-3 mb-4">
            <div className="flex-[2]">
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">First name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                maxLength={50}
                className="w-full px-3 py-2.5 rounded-xl bg-brand-50 border-2 border-transparent focus:border-brand-400 focus:bg-white text-sm font-medium focus:outline-none transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="21"
                min={16} max={99}
                className="w-full px-3 py-2.5 rounded-xl bg-brand-50 border-2 border-transparent focus:border-brand-400 focus:bg-white text-sm font-medium focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Gender */}
          <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Gender</label>
          <div className="grid grid-cols-4 gap-2">
            {GENDERS.map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, gender: g.value }))}
                className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                  form.gender === g.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-100 text-slate-400 hover:border-brand-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* University + Year */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-50">
          <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">University</label>
          <select
            value={form.university}
            onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl bg-brand-50 border-2 border-transparent focus:border-brand-400 focus:bg-white text-sm focus:outline-none transition-all appearance-none mb-4"
          >
            <option value="">Select university…</option>
            {UK_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Year of Study</label>
          <div className="grid grid-cols-4 gap-2">
            {YEARS.map(y => (
              <button
                key={y.v}
                type="button"
                onClick={() => setForm(f => ({ ...f, year_of_study: y.v }))}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  form.year_of_study === y.v
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-100 text-slate-400 hover:border-brand-200'
                }`}
              >
                {y.l}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-50">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bio</label>
            <span className="text-[11px] text-slate-300">{form.bio.length}/280</span>
          </div>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell future housemates about your vibe, routine, what you're studying…"
            rows={4}
            maxLength={280}
            className="w-full px-3 py-2.5 rounded-xl bg-brand-50 border-2 border-transparent focus:border-brand-400 focus:bg-white text-sm focus:outline-none transition-all resize-none placeholder-slate-300 leading-relaxed"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 rounded-xl p-3 text-sm border border-rose-100">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Bottom save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-brand text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        <div className="h-4" />
      </div>
    </div>
  )
}
