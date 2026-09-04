import { useParams } from 'react-router-dom'
import { Header, Phone } from '@/components/Layout'
import { useAppStore } from '@/store/useAppStore'
import { fmtDate, fmtWon, remainingToRegular } from '@/lib/regular'

/**
 * 단골 인증 / 가게 상세
 *
 * "27번 방문"이 이 서비스의 정체성. 결제 원장 기반이라 위조가 불가능하고,
 * "업종 기준 10회 · 현재 27회 → 인증"으로 판정 근거를 그대로 공개한다.
 *
 * 아직 기준 미달이면 "2번 남았어요" — 쌓이는 중이라는 걸 보여준다.
 */
export function StoreDetail() {
  const { regno } = useParams()
  const r = useAppStore((s) => s.regulars.find((x) => x.store.regno === regno))

  if (!r) {
    return (
      <Phone>
        <Header title="가게 정보" />
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-center text-[14px] text-ink-sub">
            결제 기록이 없는 가게예요
          </p>
        </div>
      </Phone>
    )
  }

  const remaining = remainingToRegular(r)
  const closed = r.store.status === 'closed'
  const max = Math.max(...r.monthlyVisits, 1)

  return (
    <Phone>
      <Header title={closed ? '단골집 소식' : '단골 인증'} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {closed ? (
          <ClosedNotice name={r.store.name} visits={r.visits} years={r.yearsSpan} closedAt={r.store.closedAt!} />
        ) : r.isRegular ? (
          <div className="rounded-2xl bg-gradient-to-b from-mint to-[#00B896] px-5 py-7 text-center text-white">
            <div className="mx-auto flex size-[86px] items-center justify-center rounded-full border-[3px] border-lime">
              <span className="text-[30px] font-bold">{r.visits}</span>
            </div>
            <p className="mt-4 text-[16px] font-semibold">
              {r.store.name} · 단골 {Math.max(1, Math.floor(r.yearsSpan))}년차
            </p>
            <p className="mt-1 text-[12px] text-white/85">
              {fmtDate(r.firstVisit)} – {fmtDate(r.lastVisit)} {r.visits}번 방문
            </p>
          </div>
        ) : (
          <div className="card-fill">
            <p className="text-[12px] text-ink-sub">단골까지</p>
            <p className="mt-1 text-[24px] font-bold">{remaining}번 남았어요</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-mint"
                style={{ width: `${(r.visits / r.threshold) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-mute">
              {r.store.industry} 기준 {r.threshold}회 · 현재 {r.visits}회
            </p>
          </div>
        )}

        {!closed && (
          <div className="card-fill mt-3">
            <p className="text-[11px] text-ink-mute">규칙 엔진 판정</p>
            <p className="mt-1 text-[14px] font-semibold">
              업종 기준 {r.threshold}회 · 현재 {r.visits}회 →{' '}
              {r.isRegular ? '인증 완료' : '인증 전'}
            </p>
          </div>
        )}

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[13px]">
          <Row label="첫 방문" value={fmtDate(r.firstVisit)} />
          <Row label="마지막" value={fmtDate(r.lastVisit)} />
          <Row label="총 결제" value={fmtWon(r.totalAmount)} />
        </dl>

        <div className="mt-5">
          <p className="mb-2 text-[12px] text-ink-sub">최근 1년 방문</p>
          <div className="flex h-12 items-end gap-1">
            {r.monthlyVisits.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-mint"
                style={{ height: `${Math.max(6, (v / max) * 100)}%`, opacity: v ? 1 : 0.2 }}
              />
            ))}
          </div>
        </div>

        {r.isRegular && !closed && (
          <button className="btn mt-6 bg-mint-light text-[14px] font-semibold text-mint">
            이 가게 리뷰 쓰기 (인증 단골만)
          </button>
        )}
        {closed && (
          <button className="btn-ghost mt-6 border-mint text-mint">
            비슷한 {r.store.industry}점 찾아보기
          </button>
        )}
      </div>
    </Phone>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-sub">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function ClosedNotice({
  name,
  visits,
  years,
  closedAt,
}: {
  name: string
  visits: number
  years: number
  closedAt: string
}) {
  return (
    <div className="pt-6 text-center">
      <p className="text-[20px] font-bold leading-snug">
        {name}가<br />문을 닫았어요
      </p>
      <p className="mt-3 text-[13px] text-ink-sub">
        {Math.floor(years)}년 동안 {visits}번 다니셨던 곳이에요
      </p>
      <p className="mt-4 rounded-xl bg-fill px-4 py-3 text-[11px] leading-relaxed text-ink-mute">
        국세청 사업자등록상태 조회 결과
        <br />
        {fmtDate(closedAt)} 폐업 확인
      </p>
    </div>
  )
}
