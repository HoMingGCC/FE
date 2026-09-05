import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, Phone } from '@/components/Layout'
import { DASHBOARD_ACTIVE, MESSAGE_TEMPLATES } from '@/mocks/merchant'

/**
 * 소식 보내기
 *
 * 아이엠샵 푸시가 실패한 원인은 서버 부하가 아니라 수신자 피로였다.
 * 그래서 발송 슬롯을 주 2건으로 제한한다 — 슬롯이 희소해야 광고 상품이 성립한다.
 *
 * 대상은 "6개월 이상 미방문 단골"로 좁힌다. 잠재 고객이 아니라
 * 이미 그 가게 손님이었던 사람이라 프라이버시 질문을 자초하지 않는다.
 */
export function SendNews() {
  const nav = useNavigate()
  const d = DASHBOARD_ACTIVE
  const [picked, setPicked] = useState(0)
  const [custom, setCustom] = useState('')
  const [sent, setSent] = useState(false)

  const isCustom = picked === MESSAGE_TEMPLATES.length - 1
  const body = isCustom ? custom : MESSAGE_TEMPLATES[picked]
  const remaining = d.weeklySlotTotal - d.weeklySlotUsed
  const canSend = body.trim().length > 0 && remaining > 0

  if (sent) {
    return (
      <Phone>
        <Header title="소식 보내기" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-mint-light">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00CBA5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </div>
          <p className="mt-5 text-[18px] font-bold">
            {d.dormantCount}명에게 보냈어요
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-sub">
            방문해서 결제가 일어나면
            <br />
            그때 수수료가 발생합니다
          </p>
          <button className="btn-primary mt-8" onClick={() => nav('/merchant')}>
            대시보드로
          </button>
        </div>
      </Phone>
    )
  }

  return (
    <Phone>
      <Header title="소식 보내기" />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="card">
          <p className="text-[12px] text-ink-sub">받는 대상</p>
          <p className="mt-1 text-[15px] font-semibold">
            6개월 이상 미방문 단골 · {d.dormantCount}명
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-mute">
            이미 이 가게 손님이었던 분들이에요
          </p>
        </div>

        <div className="card-mint mt-3">
          <p className="text-[12px] text-mint">이번 주 발송 슬롯</p>
          <p className="mt-0.5 text-[22px] font-bold text-mint">
            {remaining}
            <span className="ml-0.5 text-[13px] font-medium text-ink-sub">
              /{d.weeklySlotTotal}건 남음
            </span>
          </p>
        </div>

        <p className="mb-2 mt-5 text-[13px] font-semibold">보낼 내용</p>
        <div className="space-y-2">
          {MESSAGE_TEMPLATES.map((t, i) => {
            const on = picked === i
            return (
              <button
                key={t}
                onClick={() => setPicked(i)}
                aria-pressed={on}
                className={`w-full rounded-xl border px-3.5 py-3 text-left text-[13px] transition-colors ${
                  on ? 'border-mint bg-mint-light font-medium text-mint' : 'border-line'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>

        {isCustom && (
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={60}
            placeholder="단골에게 전할 한 줄을 적어주세요"
            className="mt-2 h-20 w-full resize-none rounded-xl border border-line p-3 text-[13px] outline-none focus:border-mint"
          />
        )}

        {body && (
          <>
            <p className="mb-2 mt-5 text-[13px] font-semibold">미리보기</p>
            <div className="rounded-xl bg-[#FAF6E8] p-3.5">
              <p className="text-[13px] font-medium">대구 왔는교? 반갑데이!</p>
              <p className="mt-1.5 text-[13px] leading-relaxed">
                {d.store.name} — {body}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line px-4 py-3.5">
        <button
          className="btn-primary disabled:bg-neutral-200 disabled:text-ink-mute"
          disabled={!canSend}
          onClick={() => setSent(true)}
        >
          소식 보내기
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-mute">
          노출 무료 · 결제 발생 시에만 과금
        </p>
      </div>
    </Phone>
  )
}
