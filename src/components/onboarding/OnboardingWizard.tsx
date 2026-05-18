'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { OnboardingData, Gender, SleepSchedule, SocialPref, SmokingPref, GuestFrequency, NoiseTolerance, HousingDuration } from '@/types'
import Step1BasicInfo from './Step1BasicInfo'
import Step2Lifestyle from './Step2Lifestyle'
import Step3Interests from './Step3Interests'
import Step4Requirements from './Step4Requirements'
import Step5Origin from './Step5Origin'

const TOTAL_STEPS = 5

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

const defaultData: OnboardingData = {
  step1: { name: '', age: '', university: '', year_of_study: '1', gender: '', bio: '' },
  step2: {
    sleep_schedule: 'flexible', cleanliness_level: 3, social_preference: 'balanced',
    smoking: 'non_smoker', guests_frequency: 'occasionally', noise_tolerance: 'moderate',
    pet_friendly: false, deal_breaker: 'none',
  },
  step3: { tags: [] },
  step4: {
    budget_min: 500, budget_max: 1000, preferred_areas: [], group_size: 2,
    move_in_date: '', duration: 'flexible',
  },
  step5: { country: '', languages: [], match_same_origin: false },
}

export default function OnboardingWizard({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<OnboardingData>(defaultData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function next() { setDir(1); setStep(s => s + 1) }
  function back() { setDir(-1); setStep(s => s - 1) }

  function updateStep1(vals: Partial<OnboardingData['step1']>) {
    setData(d => ({ ...d, step1: { ...d.step1, ...vals } }))
  }
  function updateStep2(vals: Partial<OnboardingData['step2']>) {
    setData(d => ({ ...d, step2: { ...d.step2, ...vals } }))
  }
  function updateStep3(vals: Partial<OnboardingData['step3']>) {
    setData(d => ({ ...d, step3: { ...d.step3, ...vals } }))
  }
  function updateStep4(vals: Partial<OnboardingData['step4']>) {
    setData(d => ({ ...d, step4: { ...d.step4, ...vals } }))
  }
  function updateStep5(vals: Partial<OnboardingData['step5']>) {
    setData(d => ({ ...d, step5: { ...d.step5, ...vals } }))
  }

  async function handleFinish() {
    setSaving(true)
    setError('')
    try {
      const { step1, step2, step3, step4, step5 } = data

      const { error: e1 } = await supabase
        .from('profiles')
        .update({
          name:              step1.name,
          age:               parseInt(step1.age) || null,
          university:        step1.university,
          year_of_study:     parseInt(step1.year_of_study) || null,
          gender:            step1.gender || null,
          bio:               step1.bio,
          country:           step5.country || null,
          languages:         step5.languages,
          match_same_origin: step5.match_same_origin,
          onboarding_complete: true,
        })
        .eq('id', userId)
      if (e1) throw e1

      const { error: e2 } = await supabase
        .from('lifestyle_preferences')
        .upsert({ profile_id: userId, ...step2 })
      if (e2) throw e2

      const { error: e3 } = await supabase
        .from('user_interests')
        .upsert({ profile_id: userId, tags: step3.tags })
      if (e3) throw e3

      const { error: e4 } = await supabase
        .from('housing_requirements')
        .upsert({
          profile_id:      userId,
          budget_min:      step4.budget_min,
          budget_max:      step4.budget_max,
          preferred_areas: step4.preferred_areas,
          group_size:      step4.group_size,
          move_in_date:    step4.move_in_date || null,
          duration:        step4.duration,
        })
      if (e4) throw e4

      router.push('/explore')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const stepLabels = ['Basic Info', 'Lifestyle', 'Interests', 'Requirements', 'Origin']

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-brand-100 px-4 pt-safe-top">
        <div className="max-w-lg mx-auto py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-extrabold gradient-text">Roomeet</span>
            <span className="text-sm text-slate-400 font-medium">Step {step} of {TOTAL_STEPS}</span>
          </div>

          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-gradient-brand' : 'bg-brand-100'
                }`}
              />
            ))}
          </div>

          <div className="flex mt-2">
            {stepLabels.map((label, i) => (
              <div key={label} className={`flex-1 text-center text-[10px] font-semibold transition-colors ${
                i + 1 === step ? 'text-brand-600' : i + 1 < step ? 'text-brand-400' : 'text-slate-300'
              }`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full"
          >
            <div className="max-w-lg mx-auto px-4 py-6 h-full flex flex-col">
              {step === 1 && (
                <Step1BasicInfo data={data.step1} onChange={updateStep1} onNext={next} />
              )}
              {step === 2 && (
                <Step2Lifestyle data={data.step2} onChange={updateStep2} onNext={next} onBack={back} />
              )}
              {step === 3 && (
                <Step3Interests data={data.step3} onChange={updateStep3} onNext={next} onBack={back} />
              )}
              {step === 4 && (
                <Step4Requirements data={data.step4} onChange={updateStep4} onNext={next} onBack={back} />
              )}
              {step === 5 && (
                <Step5Origin
                  data={data.step5}
                  onChange={updateStep5}
                  onNext={handleFinish}
                  onBack={back}
                  saving={saving}
                  error={error}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
