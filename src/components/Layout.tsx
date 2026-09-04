import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

/** 모바일 웹뷰 기준 — 데스크톱에서는 가운데 폰 프레임으로 */
export function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-neutral-100">
      <div className="relative flex min-h-dvh w-full max-w-[420px] flex-col bg-white">
        {children}
      </div>
    </div>
  )
}

export function Header({
  title,
  back = true,
  home = true,
}: {
  title: string
  back?: boolean
  home?: boolean
}) {
  const nav = useNavigate()
  return (
    <header className="flex shrink-0 items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        {back && (
          <button onClick={() => nav(-1)} aria-label="뒤로" className="-m-1 p-1">
            <Icon name="back" />
          </button>
        )}
        <h1 className="text-[17px] font-semibold">{title}</h1>
      </div>
      {home && (
        <button onClick={() => nav('/')} aria-label="홈" className="-m-1 p-1">
          <Icon name="home" />
        </button>
      )}
    </header>
  )
}

const TABS = [
  { to: '/map', label: '지도', icon: 'map' as const },
  { to: '/feed', label: '소식', icon: 'bell' as const },
  { to: '/me', label: '내정보', icon: 'user' as const },
]

export function TabBar() {
  return (
    <nav className="flex shrink-0 border-t border-line bg-white">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
        >
          {({ isActive }) => (
            <>
              <Icon name={t.icon} active={isActive} />
              <span
                className={`text-[11px] ${isActive ? 'font-medium text-mint' : 'text-ink-mute'}`}
              >
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/** 아이콘 — 외부 라이브러리 없이 인라인 SVG로 */
type IconName = 'back' | 'home' | 'map' | 'bell' | 'user' | 'right' | 'check'

export function Icon({
  name,
  active = false,
  className = '',
}: {
  name: IconName
  active?: boolean
  className?: string
}) {
  const stroke = active ? '#00CBA5' : 'currentColor'
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }
  switch (name) {
    case 'back':
      return (
        <svg {...common}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      )
    case 'right':
      return (
        <svg {...common} width={18} height={18}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      )
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 10.5L12 4l8 6.5V20H4z" />
        </svg>
      )
    case 'map':
      return (
        <svg {...common}>
          <path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 15V10a6 6 0 10-12 0v5l-1.5 3h15z" />
          <path d="M10 21h4" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common} width={18} height={18}>
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      )
  }
}
