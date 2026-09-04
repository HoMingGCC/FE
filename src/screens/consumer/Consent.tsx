import { useNavigate } from 'react-router-dom'
import { Header, Icon, Phone } from '@/components/Layout'
import { useAppStore, type Period } from '@/store/useAppStore'

/**
 * 마이데이터 동의
 *
 * 동의율이 서비스 생사를 가르는 화면.
 * "데이터를 주세요"가 아니라 "지도를 만들어드릴게요" — 결과를 먼저 제안한다.
 * 그리고 지역화폐로 이미 잡힌 곳이 있다는 걸 먼저 보여준다 (빈손으로 동의를 구하지 않는다).
 */
export function Consent() {
  const nav = useNavigate()
  const { consent, toggleConsent, regulars } = useAppStore()
  const ready = regulars.length

  const items = [
    {
      key: 'merchantInfo' as const,
      title: '가맹점명 · 사업자번호 조회',
      desc: '단골 판정에 사용해요',
    },
    {
      key: 'approvals5y' as const,
      title: '최근 5년 승인내역',
      desc: '「신용정보의 이용 및 보호에 관한 법률」 제20조의2',
    },
    {
      key: 'marketing' as const,
      title: '마케팅 정보 수신',
      desc: '단골집 소식과 폐업 알림',
    },
  ]

  const canProceed = consent.merchantInfo && consent.approvals5y

  return (
    <Phone>
      <Header title="단골 지도 만들기" />
      <div className="flex flex-1 flex-col px-4 pb-6">
        <h2 className="text-[21px] font-bold leading-snug">
          대학 때 다니던 가게들을
          <br />
          지도로 만들어 드릴게요
        </h2>
        <p className="mt-1.5 text-[13px] text-ink-sub">
          결제 내역으로 단골 지도를 복원합니다
        </p>

        {ready > 0 && (
          <div className="card-mint mt-4">
            <p className="text-[14px] font-semibold text-mint">
              이미 {ready}곳이 준비됐어요
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#4A8A7A]">
              지역화폐로 다니신 가게입니다.
              <br />
              동의하시면 카드 결제까지 더해져요.
            </p>
          </div>
        )}

        <ul className="mt-5">
          {items.map((it, i) => (
            <li key={it.key}>
              <button
                onClick={() => toggleConsent(it.key)}
                className="flex w-full items-start gap-3 py-3.5 text-left"
                aria-pressed={consent[it.key]}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded ${
                    consent[it.key] ? 'bg-mint text-white' : 'bg-neutral-200'
                  }`}
                >
                  <Icon name="check" className="!size-3.5 !stroke-[2.5]" />
                </span>
                <span>
                  <span className="block text-[14px] font-medium">{it.title}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-mute">
                    {it.desc}
                  </span>
                </span>
              </button>
              {i < items.length - 1 && <hr className="border-line" />}
            </li>
          ))}
        </ul>

        <p className="mt-auto pt-6 text-center text-[11px] leading-relaxed text-ink-mute">
          대구·경북 지역 결제만 보여드려요
          <br />
          교통 이용은 제외됩니다
        </p>
        <button
          className="btn-primary mt-3 disabled:bg-neutral-200 disabled:text-ink-mute"
          disabled={!canProceed}
          onClick={() => nav('/onboard/period')}
        >
          다음
        </button>
      </div>
    </Phone>
  )
}

/** 소급 기간 선택 — 기본값은 "고향 거주 기간" */
export function PeriodSelect() {
  const nav = useNavigate()
  const { period, setPeriod, buildMap } = useAppStore()

  const options: Array<{ key: Period; label: string }> = [
    { key: '1y', label: '최근 1년' },
    { key: 'campus', label: '고향 거주 기간 · 2021–2025' },
    { key: '5y', label: '5년 전부' },
  ]

  return (
    <Phone>
      <Header title="기간 선택" />
      <div className="flex flex-1 flex-col px-4 pb-6">
        <p className="text-[13px] text-ink-sub">
          기본값은 고향에 계셨던 기간이에요
        </p>

        <div className="mt-4 space-y-2.5">
          {options.map((o) => {
            const on = period === o.key
            return (
              <button
                key={o.key}
                onClick={() => setPeriod(o.key)}
                aria-pressed={on}
                className={`w-full rounded-xl border py-3.5 text-[14px] transition-colors ${
                  on
                    ? 'border-mint bg-mint-light font-medium text-mint'
                    : 'border-line text-ink'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>

        <div className="card-fill mt-5">
          <p className="text-[11px] text-ink-mute">화면에 뜨는 결제</p>
          <p className="mt-0.5 text-[14px] font-semibold text-mint">
            대구 · 경북 지역만
          </p>
        </div>

        <button
          className="btn-primary mt-auto"
          onClick={() => {
            buildMap()
            nav('/onboard/loading')
          }}
        >
          동의하고 지도 만들기
        </button>
      </div>
    </Phone>
  )
}
