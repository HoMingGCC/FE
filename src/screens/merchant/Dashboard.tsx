import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Phone } from '@/components/Layout'
import { DASHBOARDS } from '@/mocks/merchant'

/**
 * 사장님 대시보드
 *
 * "랭킹 노출까지 8명 부족"은 문제 제기고, 그 아래 안내 카드가 해결의 실마리다.
 * 둘이 붙어 있어야 계좌 전환 동기가 생긴다.
 *
 * 단골이 0명인 케이스가 발표 스크린샷용 — "손님이 없어서가 아니라
 * 결제 데이터가 없어서"라는 걸 눈으로 확인하게 된다.
 */
export function MerchantDashboard() {
  const nav = useNavigate()
  const [idx, setIdx] = useState(0)
  const d = DASHBOARDS[idx]

  const remaining = Math.max(0, d.rankThreshold - d.regularCount)
  const progress = Math.min(100, (d.regularCount / d.rankThreshold) * 100)
  const locked = d.regularCount === 0

  return (
    <Phone>
      <Header title={`내 가게 (${d.store.name})`} />

      {/* 데모용 케이스 전환 — 실서비스에는 없음 */}
      <div className="flex shrink-0 gap-1.5 px-4 pb-3">
        {DASHBOARDS.map((x, i) => (
          <button
            key={x.store.regno}
            onClick={() => setIdx(i)}
            className={i === idx ? 'chip-on' : 'chip-off'}
          >
            {x.regularCount > 0 ? '가맹점' : '미가맹'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="card">
          <div className="flex items-start justify-between">
            <span className="text-[13px] text-ink-sub">
              iM뱅크 결제 기준 단골
            </span>
            <span className="text-[11px] text-ink-mute">최근 2년 · 5회 이상</span>
          </div>
          <p className="mt-1 text-[30px] font-bold leading-none">
            {d.regularCount}
            <span className="ml-0.5 text-[15px] font-medium">명</span>
          </p>
          <div className="mt-3.5 flex gap-9">
            <div>
              <p className="text-[19px] font-semibold text-[#E8A33D]">
                {d.dormantCount}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-mute">6개월+ 미방문</p>
            </div>
            <div>
              <p className="text-[19px] font-semibold text-mint">
                +{d.newThisMonth}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-mute">이번 달 신규</p>
            </div>
          </div>
        </div>

        {!locked && (
          <div className="card-fill mt-3">
            <p className="text-[14px] font-semibold">
              랭킹 노출까지 {remaining}명 부족
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-mint"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-mute">
              기준 {d.rankThreshold}명 · 현재 {d.regularCount}명 (iM뱅크 결제 기준)
            </p>
          </div>
        )}

        {/* 계좌 전환의 실마리 — 버튼 없이 문장 두 줄 */}
        <div className="card-mint mt-3">
          <p className="text-[14px] font-semibold text-mint">
            {locked
              ? '손님이 없어서가 아니에요'
              : '실제 단골은 더 많을 수 있어요'}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#4A8A7A]">
            {locked
              ? '아직 결제 데이터가 없어 집계되지 않습니다'
              : '타행 결제는 집계되지 않습니다'}
          </p>
        </div>

        {locked ? (
          <div className="card-fill mt-3">
            <p className="text-[12px] leading-relaxed text-ink-mute">
              🔒 랭킹 노출 · 소식 보내기
              <br />
              결제 데이터가 있어야 이용할 수 있어요
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={() => nav('/merchant/send')}
              className="btn-primary mt-5"
            >
              소식 보내기
            </button>
            <p className="mt-2 text-center text-[11px] text-ink-mute">
              이번 주 남은 발송 {d.weeklySlotTotal - d.weeklySlotUsed}건 중{' '}
              {d.weeklySlotUsed}건 사용
            </p>
          </>
        )}
      </div>
    </Phone>
  )
}
