import type { LifestylePreferences, UserInterests, HousingRequirements } from '@/types'

interface ScoringInput {
  lifestyle: LifestylePreferences | null
  interests: UserInterests | null
  housing: HousingRequirements | null
}

export function computeCompatibilityScore(a: ScoringInput, b: ScoringInput): number {
  let score = 0
  let weight = 0

  // --- Lifestyle (40 points) ---
  if (a.lifestyle && b.lifestyle) {
    weight += 40

    // Sleep schedule (10 pts)
    if (a.lifestyle.sleep_schedule === b.lifestyle.sleep_schedule) score += 10
    else if (a.lifestyle.sleep_schedule === 'flexible' || b.lifestyle.sleep_schedule === 'flexible') score += 6

    // Cleanliness delta (10 pts)
    const cleanDelta = Math.abs(a.lifestyle.cleanliness_level - b.lifestyle.cleanliness_level)
    score += Math.max(0, 10 - cleanDelta * 3)

    // Social preference (8 pts)
    if (a.lifestyle.social_preference === b.lifestyle.social_preference) score += 8
    else if (a.lifestyle.social_preference === 'balanced' || b.lifestyle.social_preference === 'balanced') score += 4

    // Smoking (7 pts)
    if (a.lifestyle.smoking === b.lifestyle.smoking) score += 7
    else if (a.lifestyle.smoking !== 'smoker' && b.lifestyle.smoking !== 'smoker') score += 4

    // Noise tolerance (5 pts)
    if (a.lifestyle.noise_tolerance === b.lifestyle.noise_tolerance) score += 5
    else if (Math.abs(
      levelOf(a.lifestyle.noise_tolerance) - levelOf(b.lifestyle.noise_tolerance),
    ) <= 1) score += 2
  }

  // --- Interests (30 points) ---
  if (a.interests && b.interests) {
    weight += 30
    const aSet = new Set(a.interests.tags)
    const bSet = new Set(b.interests.tags)
    const intersection = a.interests.tags.filter(t => bSet.has(t)).length
    const union = new Set([...a.interests.tags, ...b.interests.tags]).size
    if (union > 0) {
      score += Math.round((intersection / union) * 30)
    }
  }

  // --- Housing (30 points) ---
  if (a.housing && b.housing) {
    weight += 30

    // Budget overlap (15 pts)
    const overlapMin = Math.max(a.housing.budget_min, b.housing.budget_min)
    const overlapMax = Math.min(a.housing.budget_max, b.housing.budget_max)
    if (overlapMax >= overlapMin) score += 15

    // Group size match (10 pts)
    if (a.housing.group_size === b.housing.group_size) score += 10
    else if (Math.abs(a.housing.group_size - b.housing.group_size) === 1) score += 5

    // Duration match (5 pts)
    if (a.housing.duration === b.housing.duration) score += 5
    else if (a.housing.duration === 'flexible' || b.housing.duration === 'flexible') score += 3
  }

  if (weight === 0) return 0
  return Math.round((score / weight) * 100)
}

function levelOf(noise: string): number {
  return noise === 'quiet' ? 0 : noise === 'moderate' ? 1 : 2
}

export function compatibilityLabel(score: number): string {
  if (score >= 85) return 'Excellent match'
  if (score >= 70) return 'Great match'
  if (score >= 55) return 'Good match'
  if (score >= 40) return 'Decent match'
  return 'Low compatibility'
}

export function compatibilityColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 bg-emerald-50'
  if (score >= 70) return 'text-brand-600 bg-brand-50'
  if (score >= 55) return 'text-indigo-600 bg-indigo-50'
  if (score >= 40) return 'text-amber-600 bg-amber-50'
  return 'text-rose-600 bg-rose-50'
}
