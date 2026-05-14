export type SleepSchedule  = 'night_owl' | 'early_bird' | 'flexible'
export type SocialPref     = 'social' | 'private' | 'balanced'
export type SmokingPref    = 'smoker' | 'non_smoker' | 'outside_only'
export type GuestFrequency = 'often' | 'occasionally' | 'rarely' | 'never'
export type NoiseTolerance = 'quiet' | 'moderate' | 'loud'
export type HousingDuration = 'short_term' | 'academic_year' | 'long_term' | 'flexible'
export type MatchStatus    = 'pending' | 'accepted' | 'rejected'
export type Gender         = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say'
export type DealBreaker    = 'noise' | 'smoking' | 'guests' | 'pets' | 'cleanliness' | 'early_riser' | 'night_owl' | 'none'
export type FlatSwipeDir   = 'like' | 'pass'

export interface Profile {
  id: string
  email: string
  name: string
  age: number | null
  university: string
  year_of_study: number | null
  gender: Gender | null
  avatar_url: string | null
  bio: string
  is_verified: boolean
  onboarding_complete: boolean
  country: string | null
  languages: string[]
  match_same_origin: boolean
  created_at: string
  updated_at: string
}

export interface LifestylePreferences {
  id: string
  profile_id: string
  sleep_schedule: SleepSchedule
  cleanliness_level: number
  social_preference: SocialPref
  smoking: SmokingPref
  guests_frequency: GuestFrequency
  noise_tolerance: NoiseTolerance
  pet_friendly: boolean
  deal_breaker: DealBreaker
}

export interface Group {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  profile_id: string
  joined_at: string
}

export interface GroupMessage {
  id: string
  group_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface FlatListing {
  id: string
  title: string
  area: string
  price: number
  bedrooms: number
  image_url: string
  description: string
  available_from: string
}

export interface FlatSwipe {
  id: string
  flat_id: string
  profile_id: string
  match_id: string
  direction: FlatSwipeDir
  created_at: string
}

export interface UserInterests {
  id: string
  profile_id: string
  tags: string[]
}

export interface HousingRequirements {
  id: string
  profile_id: string
  budget_min: number
  budget_max: number
  preferred_areas: string[]
  group_size: number
  move_in_date: string | null
  duration: HousingDuration
}

export interface Match {
  id: string
  requester_id: string
  receiver_id: string
  status: MatchStatus
  compatibility_score: number | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface FullProfile {
  profile: Profile
  lifestyle: LifestylePreferences | null
  interests: UserInterests | null
  housing: HousingRequirements | null
  compatibility_score?: number
}

export interface OnboardingData {
  step1: {
    name: string
    age: string
    university: string
    year_of_study: string
    gender: Gender | ''
    bio: string
  }
  step2: {
    sleep_schedule: SleepSchedule
    cleanliness_level: number
    social_preference: SocialPref
    smoking: SmokingPref
    guests_frequency: GuestFrequency
    noise_tolerance: NoiseTolerance
    pet_friendly: boolean
    deal_breaker: DealBreaker
  }
  step3: {
    tags: string[]
  }
  step4: {
    budget_min: number
    budget_max: number
    preferred_areas: string[]
    group_size: number
    move_in_date: string
    duration: HousingDuration
  }
  step5: {
    country: string
    languages: string[]
    match_same_origin: boolean
  }
}

export const INTEREST_TAGS = [
  'Gaming', 'Sports', 'Cooking', 'Reading', 'Music', 'Art & Design',
  'Film & TV', 'Travel', 'Gym & Fitness', 'Yoga', 'Photography',
  'Dancing', 'Coding', 'Fashion', 'Foodie', 'Nature & Hiking',
  'Volunteering', 'Chess', 'Podcasts', 'Coffee Lover',
] as const

export const UK_UNIVERSITIES = [
  'University of Oxford', 'University of Cambridge', 'Imperial College London',
  'University College London (UCL)', "King's College London", 'London School of Economics',
  'University of Edinburgh', 'University of Manchester', 'University of Bristol',
  'University of Warwick', 'University of Glasgow', 'University of Birmingham',
  'University of Leeds', 'University of Sheffield', 'University of Nottingham',
  'Durham University', 'University of Southampton', 'University of Liverpool',
  'University of Bath', 'University of Exeter', 'Cardiff University',
  'Queen Mary University of London', 'University of St Andrews',
  'Newcastle University', 'University of York', 'University of Leicester',
  'Loughborough University', 'Other',
]
