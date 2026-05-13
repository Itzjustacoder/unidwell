'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Heart, MessageCircle, User } from 'lucide-react'

const tabs = [
  { href: '/explore',  icon: Compass,        label: 'Explore'  },
  { href: '/matches',  icon: Heart,          label: 'Matches'  },
  { href: '/chat',     icon: MessageCircle,  label: 'Chat'     },
  { href: '/profile',  icon: User,           label: 'Profile'  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 nav-safe-bottom">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-brand-600' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
