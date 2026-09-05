import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Phone, TabBar } from '@/components/Layout'
import { KakaoMap } from '@/components/KakaoMap'
import { RegularAchieved } from '@/components/RegularAchieved'
import { DemoHint } from '@/components/DemoHint'
import { useAppStore } from '@/store/useAppStore'
import { countBySource, fmtDate } from '@/lib/regular'
import type { RegularStatus } from '@/types'

/**
 * 나의 단골 지도 (홈)
 *
 * 핀에 방문 횟수를 직접 얹는 게 이 화면의 정체성.
 * 지도를 헤더 아래부터 하단탭 위까지 꽉 채우고, 토글·배너·요약은 그 위에 띄운다.
 * 오버레이 컨테이너는 pointer-events-none 이라 빈 곳에서도 지도를 끌 수 있다.
 */
export function MapHome() {
  const nav = useNavigate()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [achieved, setAchieved] = useState(true)
  const { regulars, journey, ctx } = useAppStore()

  const counts = useMemo(() => countBySource(regulars), [regulars])
  const closed = regulars.filter((r) => r.store.status === 'closed').length
  const district = regulars[0]?.store.district ?? '대구'

  const newRegular = regulars.find(
    (r) => r.isRegular && r.store.status === 'open',
  )

  const isMap = view === 'map'

  return (
    <Phone>
      <header className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <button onClick={() => nav(-1)} aria-label="뒤로" className="-m-1 p-1">
            <Icon name="back" />
          </button>
          <h1 className="text-[17px] font-semibold">나의 단골 지도</h1>
        </div>
        <button onClick={() => nav('/')} aria-label="홈" className="-m-1 p-1">
          <Icon name="home" />
        </button>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {isMap ? (
          <KakaoMap
            items={regulars}
            onPick={(r) => nav(`/store/${r.store.regno}`)}
          />
        ) : (
          <StoreList
            items={regulars}
            onPick={(r) => nav(`/store/${r.store.regno}`)}
          />
        )}

        {/* 상단 오버레이 — 토글 + 금융 여정 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 space-y-2.5 p-4">
          <div className="pointer-events-auto flex gap-1.5">
            <button
              className={
                isMap ? 'chip-on shadow-sm' : 'chip-off bg-white shadow-sm'
              }
              onClick={() => setView('map')}
            >
              지도 보기
            </button>
            <button
              className={
                !isMap ? 'chip-on shadow-sm' : 'chip-off bg-white shadow-sm'
              }
              onClick={() => setView('list')}
            >
              목록 보기
            </button>
          </div>

          {isMap && (
            <button
              onClick={() => nav('/feed')}
              className="pointer-events-auto w-full rounded-xl bg-mint-light/95 px-3.5 py-3 text-left shadow-sm backdrop-blur-sm"
            >
              <span className="block text-[11px] text-[#4A8A7A]">
                나의 금융 여정
              </span>
              <span className="mt-0.5 block text-[14px] font-semibold text-mint">
                지금은 {journey.label} 단계예요
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-sub">
                {journey.products[0]} 알아보기 ›
              </span>
            </button>
          )}
        </div>

        {/* 하단 오버레이 — 요약 */}
        {isMap && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 rounded-xl bg-white/95 p-3.5 shadow-lg backdrop-blur-sm">
            <p className="text-[12px] text-ink-sub">복원된 단골</p>
            <p className="mt-0.5 text-[18px] font-bold text-mint">
              {counts.total}곳 · {ctx.homeRegion === 'pohang' ? '포항' : '대구'}{' '}
              {district}
            </p>
            <p className="mt-1 text-[12px] text-ink-mute">
              지역화폐 {counts.localpay}곳 · 카드 {counts.card}곳
              {closed > 0 && ` · 폐업 ${closed}곳`}
            </p>
          </div>
        )}
      </div>

      {achieved && newRegular && (
        <RegularAchieved item={newRegular} onClose={() => setAchieved(false)} />
      )}
      {!achieved && isMap && (
        <DemoHint text="핀을 눌러 단골 인증을 확인해보세요" />
      )}

      <TabBar />
    </Phone>
  )
}

function StoreList({
  items,
  onPick,
}: {
  items: RegularStatus[]
  onPick: (r: RegularStatus) => void
}) {
  const groups = [
    { label: '음식', keys: ['meal', 'cafe', 'drink'] },
    { label: '생활', keys: ['life'] },
  ]
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-16">
      {groups.map((g) => {
        const rows = items.filter((r) => g.keys.includes(r.store.category))
        if (!rows.length) return null
        return (
          <section key={g.label} className="mb-4">
            <h2 className="mb-1.5 text-[12px] font-medium text-ink-mute">
              {g.label}
            </h2>
            <ul>
              {rows.map((r) => (
                <li key={r.store.regno}>
                  <button
                    onClick={() => onPick(r)}
                    className="flex w-full items-center gap-3 border-b border-line py-3 text-left last:border-0"
                  >
                    <span className="size-9 shrink-0 rounded-lg bg-neutral-100" />
                    <span className="flex-1">
                      <span className="block text-[14px] font-medium">
                        {r.store.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-mute">
                        {r.store.status === 'closed'
                          ? `폐업 · ${fmtDate(r.store.closedAt!)}`
                          : `업종 기준 ${r.threshold}회 · 현재 ${r.visits}회`}
                      </span>
                    </span>
                    {r.isRegular && r.store.status === 'open' && (
                      <span className="rounded bg-mint-light px-1.5 py-0.5 text-[10px] font-medium text-mint">
                        단골
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
