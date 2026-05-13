import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isStudentEmail(email: string): boolean {
  return /\.(edu|ac\.uk)$/i.test(email)
}

export function getAvatarUrl(name: string, seed?: string): string {
  const s = encodeURIComponent(seed ?? name)
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${s}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`
}

export function formatBudget(min: number, max: number): string {
  return `£${min}–£${max}/mo`
}

export function yearLabel(year: number): string {
  const map: Record<number, string> = {
    1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year',
    5: '5th Year', 6: 'Postgrad', 7: 'PhD', 8: 'Other',
  }
  return map[year] ?? `Year ${year}`
}

export function genderLabel(g: string): string {
  const map: Record<string, string> = {
    male: 'Male', female: 'Female',
    non_binary: 'Non-binary', prefer_not_to_say: 'Prefer not to say',
  }
  return map[g] ?? g
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
