import { DemoHint } from '@/components/DemoHint'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, Phone } from '@/components/Layout'
import { rankingOf, VISITOR_TABS, WELCOME } from '@/mocks/visitor'
import type { Category } from '@/types'

/**
 * QR 진입 — 단골 보증 리스트
 *
 * 상권은 QR URL의 코드로 판별한다 (?d=seomun). GPS 상시추적 아님.
 *
 * 전환 유도는 리스트 끝의 텍스트 링크로 둔다. 버튼으로 하면 광고처럼 보이고,
 * 5개를 다 보고 나서 만나야 밀어붙이는 느낌이 없다.
 */
export function VisitorList() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const code = params.get('d') ?? 'seomun'
  const ranking = rankingOf(code)
  const welcome = WELCOME[code] ?? WELCOME.seomun

  const [tab, setTab] = useState<Category | 'all'>('all')
  const [modal, setModal] = useState(true)

  const open = ranking.items.filter((i) => i.isOpenNow)
  const rows = tab === 'all' ? open : open.filter((i) => i.store.category === tab)

  return (
    <Phone>
      <header className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <img src="/logo-homing.png" alt="HoMing" className="h-5 w-auto" />
        <h1 className="text-[15px] font-semibold">{ranking.districtName}</h1>
        <button onClick={() => nav('/')} aria-label="홈" className="-m-1 p-1">
          <Icon name="home" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="card-mint text-center">
          <p className="text-[15px] font-semibold">단골이 인정한 가게</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-sub">
            리뷰가 아니라 실제 결제
            <br />2년 이상 반복 방문한 사람 수입니다
          </p>
          <p className="mt-2 text-[11px] text-ink-mute">
            설치 · 가입 없이 바로 보기
          </p>
        </div>

        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-0.5">
          {VISITOR_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 ${tab === t.key ? 'chip-on' : 'chip-off'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-ink-mute">
          지금 영업 중인 가게만 표시돼요
        </p>

        <ul className="mt-3">
          {rows.map((it, i) => (
            <li key={it.store.regno}>
              <button
                onClick={() => nav(`/visit/${it.store.regno}?d=${code}`)}
                className="flex w-full items-center gap-3 border-b border-line py-3 text-left last:border-0"
              >
                <span className="w-4 shrink-0 text-[15px] font-semibold text-mint">
                  {i + 1}
                </span>
                <span className="size-10 shrink-0 rounded-lg bg-neutral-100" />
                <span className="flex-1">
                  <span className="block text-[14px] font-medium">
                    {it.store.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-sub">
                    단골 {it.regularCount}명 ·{' '}
                    <span className="text-mint">영업 중</span> · 도보{' '}
                    {it.walkMinutes}분
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {rows.length === 0 && (
          <p className="py-10 text-center text-[13px] text-ink-mute">
            이 시간에 영업 중인 가게가 없어요
          </p>
        )}

        <button
          onClick={() => nav('/join')}
          className="mt-5 flex w-full items-center justify-between py-2"
        >
          <span className="text-[14px] font-semibold text-mint">
            당신의 단골집은 어디인가요?
          </span>
          <Icon name="right" className="text-mint" />
        </button>

        <p className="mt-4 text-[11px] text-ink-mute">
          카드·지역화폐 결제 기준입니다
        </p>
      </div>

      {modal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 px-10">
            <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#EEFFFC] to-[#C8EFD4] px-5 pb-3 pt-7 text-center">
            <button
                onClick={() => setModal(false)}
                aria-label="닫기"
                className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-black text-white"
            >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </button>

            <p className="font-shilla text-[20px] font-bold leading-snug">
                {welcome.title}
            </p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed">
                {welcome.body}
            </p>

            {/* 캐릭터 — public/character.png */}
            <img
                src="/character.png"
                alt=""
                className="pointer-events-none -mb-1 -mr-1 -mt-3 ml-auto block w-24"
                onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            </div>
        </div>
        )}
      {!modal && (
        <DemoHint text="가게를 눌러 단골 근거를 확인해보세요" />
      )}
    </Phone>
  )
}
