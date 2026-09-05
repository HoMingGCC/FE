import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Phone, TabBar } from '@/components/Layout'
import { RegularAchieved } from '@/components/RegularAchieved'
import { useAppStore } from '@/store/useAppStore'
import { countBySource, fmtDate } from '@/lib/regular'
import type { RegularStatus } from '@/types'

/**
 * 나의 단골 지도 (홈)
 *
 * 핀에 방문 횟수를 직접 얹는 게 이 화면의 정체성.
 * "내가 쓴 돈으로 그려진 지도"라는 인상이 첫눈에 와야 한다.
 *
 * 지도는 지금 목업. 카카오맵 SDK 붙일 때 <MapCanvas>만 교체하면 된다.
 */
export function MapHome() {
  const nav = useNavigate()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [achieved, setAchieved] = useState(true)
  const { regulars, journey, ctx } = useAppStore()

  const counts = useMemo(() => countBySource(regulars), [regulars])
  const closed = regulars.filter((r) => r.store.status === 'closed').length
  const district = regulars[0]?.store.district ?? '대구'

  // 축하 모달 대상 — 실서비스에서는 배치 결과에서 "이번에 새로 단골이 된 곳"
  const newRegular = regulars.find(
    (r) => r.isRegular && r.store.status === 'open',
  )

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

      <div className="flex shrink-0 gap-1.5 px-4 pb-2.5">
        <button
          className={view === 'map' ? 'chip-on' : 'chip-off'}
          onClick={() => setView('map')}
        >
          지도 보기
        </button>
        <button
          className={view === 'list' ? 'chip-on' : 'chip-off'}
          onClick={() => setView('list')}
        >
          목록 보기
        </button>
      </div>

      {/* 금융 여정 배너 — 틀은 범용, 값만 개인화 */}
      <button
        onClick={() => nav('/feed')}
        className="mx-4 mb-2.5 flex shrink-0 items-center justify-between rounded-xl border border-mint-line bg-mint-light px-3.5 py-3 text-left"
      >
        <span>
          <span className="block text-[11px] text-[#4A8A7A]">나의 금융 여정</span>
          <span className="mt-0.5 block text-[14px] font-semibold text-mint">
            지금은 {journey.label} 단계예요
          </span>
        </span>
        <Icon name="right" className="text-mint" />
      </button>

      {view === 'map' ? (
        <MapCanvas items={regulars} onPick={(r) => nav(`/store/${r.store.regno}`)} />
      ) : (
        <StoreList items={regulars} onPick={(r) => nav(`/store/${r.store.regno}`)} />
      )}

      <div className="mx-4 -mt-3 shrink-0 rounded-xl bg-white p-3.5 shadow-[0_-1px_10px_rgba(0,0,0,0.06)]">
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

      <div className="h-3" />

      {achieved && newRegular && (
        <RegularAchieved item={newRegular} onClose={() => setAchieved(false)} />
      )}

      <TabBar />
    </Phone>
  )
}

/** 지도 목업 — 카카오맵 SDK 연동 시 이 컴포넌트만 교체 */
function MapCanvas({
  items,
  onPick,
}: {
  items: RegularStatus[]
  onPick: (r: RegularStatus) => void
}) {
  const lats = items.map((r) => r.store.lat)
  const lngs = items.map((r) => r.store.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  return (
    <div className="relative flex-1 overflow-hidden bg-[#F2F2F2]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(#fff 3px, transparent 3px), linear-gradient(90deg, #fff 3px, transparent 3px)',
          backgroundSize: '54px 68px',
        }}
        aria-hidden
      />
      {items.map((r) => {
        const x = 10 + ((r.store.lng - minLng) / (maxLng - minLng || 1)) * 68
        const y = 12 + (1 - (r.store.lat - minLat) / (maxLat - minLat || 1)) * 70
        const isClosed = r.store.status === 'closed'
        return (
          <button
            key={r.store.regno}
            onClick={() => onPick(r)}
            className={`absolute -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium shadow-sm ${
              isClosed ? 'bg-neutral-400 text-white' : 'bg-mint text-white'
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {r.store.industry} {isClosed ? '폐업' : `${r.visits}회`}
          </button>
        )
      })}
    </div>
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
    <div className="flex-1 overflow-y-auto px-4 pb-4">
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
