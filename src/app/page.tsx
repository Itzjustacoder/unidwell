import Link from 'next/link'
import { Shield, Zap, MessageCircle, Users, Star, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Student-Verified Only',
    desc: 'Sign up with your .edu or .ac.uk email. We check so you don\'t have to.',
  },
  {
    icon: Zap,
    title: 'Smart Compatibility',
    desc: 'Our algorithm matches on lifestyle, interests & budget — not just looks.',
  },
  {
    icon: MessageCircle,
    title: 'Chat When Ready',
    desc: 'Send a request, get accepted, then chat. No unsolicited messages.',
  },
  {
    icon: Users,
    title: 'Solo or Group Matching',
    desc: 'Looking for one roommate or building a house of four? We\'ve got you.',
  },
]

const testimonials = [
  { name: 'Amara O.', uni: 'UCL', text: 'Found my two flatmates in a week. Best app I\'ve used for this.', score: 94 },
  { name: 'Jake R.', uni: 'Edinburgh', text: 'The lifestyle filters are chef\'s kiss. Zero awkward mismatches.', score: 88 },
  { name: 'Sofia T.', uni: 'Bristol', text: 'I was dreading house hunting. Roomie Match made it actually fun.', score: 91 },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">Roomie Match</span>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/signup"
              className="text-sm font-semibold bg-gradient-brand text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background blobs */}
        <div className="absolute top-0 -right-32 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute top-20 -left-32 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-200">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Student-only · Verified · Free to match
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            Your ideal roommate{' '}
            <span className="gradient-text">goes here.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Roomie Match matches verified students based on lifestyle, budget, and vibe.
            No landlords, no randoms — just real housemates who actually get you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-gradient-brand text-white font-bold text-base px-8 py-4 rounded-2xl hover:opacity-90 hover:shadow-glow transition-all">
              Find my roommate
              <ArrowRight size={18} />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold text-base px-8 py-4 rounded-2xl border-2 border-slate-200 hover:border-brand-300 transition-all">
              I have an account
            </Link>
          </div>

          {/* Mock phone */}
          <div className="relative mx-auto w-64 sm:w-72">
            <div className="bg-gradient-to-b from-brand-600 to-indigo-600 rounded-[2.5rem] p-1 shadow-2xl shadow-brand-300/50">
              <div className="bg-white rounded-[2rem] overflow-hidden">
                {/* Status bar */}
                <div className="bg-brand-600 h-7 flex items-center justify-between px-5">
                  <span className="text-[10px] text-white font-medium">9:41</span>
                  <span className="text-[10px] text-white">●●●</span>
                </div>
                {/* App preview */}
                <div className="p-3 space-y-2">
                  <div className="text-xs font-bold text-slate-700 px-1">Explore</div>
                  {[{name:'Maya K.',uni:'UCL',score:94,tags:['Gaming','Cooking']},{name:'Tom B.',uni:'Bristol',score:87,tags:['Gym','Music']}].map((p) => (
                    <div key={p.name} className="bg-brand-50 rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {p.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800">{p.name} · {p.uni}</div>
                        <div className="flex gap-1 mt-0.5">
                          {p.tags.map(t => (
                            <span key={t} className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        {p.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 bg-brand-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 mb-3">
            Built for student life
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Every feature designed around how students actually live.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-card border border-brand-100 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 mb-12">
            Three steps to your new home
          </h2>
          <div className="space-y-6">
            {[
              { n: '01', title: 'Verify & set up your profile', desc: 'Sign up with your uni email. Fill in your lifestyle, interests, and budget in minutes.' },
              { n: '02', title: 'Explore your matches', desc: 'Browse students with a real compatibility score. Filter by uni, budget, and lifestyle.' },
              { n: '03', title: 'Connect and find your home', desc: 'Request to chat, get accepted, and start planning your place together.' },
            ].map(step => (
              <div key={step.n} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-glow">
                  {step.n}
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 bg-brand-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-12">
            Students love it
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.uni}</div>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    {t.score}% match
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-brand rounded-3xl p-10 shadow-glow">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Ready to find your people?
            </h2>
            <p className="text-brand-200 mb-8">
              Join thousands of students already matching on Roomie Match.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup"
                className="bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl hover:bg-brand-50 transition-colors inline-flex items-center gap-2 justify-center">
                Create free account
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-brand-200 text-sm">
              {['No credit card needed', 'Verified .edu & .ac.uk only', 'Free to match'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-400">
          © 2025 Roomie Match · Student-only roommate matching
        </p>
      </footer>
    </main>
  )
}
