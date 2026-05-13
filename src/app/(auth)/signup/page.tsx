'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isStudentEmail } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const emailValid = form.email.length > 3 && isStudentEmail(form.email)
  const pwdValid   = form.password.length >= 8
  const pwdMatch   = form.password === form.confirmPassword && form.confirmPassword.length > 0

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!emailValid) return setError('Please use a valid university email (.edu or .ac.uk)')
    if (!pwdValid)   return setError('Password must be at least 8 characters')
    if (!pwdMatch)   return setError('Passwords do not match')

    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })

    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-card-lg">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Check your inbox!</h2>
          <p className="text-slate-500 text-sm mb-6">
            We sent a confirmation link to <strong className="text-slate-700">{form.email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login" className="text-sm font-semibold text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link href="/" className="text-2xl font-extrabold gradient-text mb-8">
        UniDwell
      </Link>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap size={24} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create account</h1>
          <p className="text-slate-400 text-sm mt-1">
            Students only — use your university email
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              University Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@uni.ac.uk"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm transition-colors bg-slate-50 focus:bg-white"
                required
              />
              {form.email.length > 5 && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  emailValid ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'
                }`}>
                  {emailValid ? '✓ Valid' : '.edu/.ac.uk only'}
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-slate-100 focus:border-brand-400 focus:outline-none text-sm transition-colors bg-slate-50 focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Confirm Password
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm transition-colors bg-slate-50 focus:bg-white ${
                form.confirmPassword.length > 0
                  ? pwdMatch ? 'border-emerald-300 focus:border-emerald-400' : 'border-rose-300 focus:border-rose-400'
                  : 'border-slate-100 focus:border-brand-400'
              }`}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 rounded-xl p-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center max-w-xs">
        By signing up you agree to our Terms of Service. Only .edu and .ac.uk emails are accepted.
      </p>
    </div>
  )
}
