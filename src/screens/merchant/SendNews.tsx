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
 * 대상은 두 종류.
 *  - 떠난 단골 (6개월+ 미방문) : 무료. 이미 그 가게 손님이었던 사람
 *  - 잠재 단골 (미방문)        : 유료. 잠금 상태로 보여줘 BM을 화면에 드러낸다
 */

const PUSH_BG = '/push-bg.jpg' // public/ 에 배경 이미지를 넣으세요

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

  if (sent)
    return (
      <PushResult
        body={body}
        store={d.store.name}
        onBack={() => nav('/merchant')}
      />
    )

  return (
    <Phone>
      <Header title="소식 보내기" />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <p className="mb-2 text-[13px] font-semibold">누구에게 보낼까요?</p>

        <div className="card flex items-center gap-3">
          <span className="flex size-5 shrink-0 items-center justify-center rounded bg-mint">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </span>
          <span>
            <span className="block text-[11px] text-ink-mute">떠난 단골</span>
            <span className="mt-0.5 block text-[14px] font-semibold">
              6개월 이상 미방문 단골 · {d.dormantCount}명
            </span>
          </span>
        </div>

        {/* 잠재 단골 — 유료 상품이라 잠금 상태로 노출 */}
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-neutral-100 p-3.5">
          <span className="size-5 shrink-0 rounded border-2 border-neutral-300" />
          <span className="flex-1">
            <span className="block text-[11px] text-ink-mute">잠재 단골</span>
            <span className="mt-0.5 block text-[14px] font-semibold text-ink-mute">
              27명 미방문
            </span>
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A4A4A4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-mute">
          잠재 단골 발송은 유료 상품이에요
        </p>

        <div className="card-mint mt-4">
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
                  on
                    ? 'border-mint bg-mint-light font-medium text-mint'
                    : 'border-line'
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
            maxLength={80}
            placeholder="예시) 시험기간마다 밤새우던 그곳에서 마라라면이 새로 나왔대요"
            className="mt-2 h-24 w-full resize-none rounded-xl border border-line p-3 text-[13px] leading-relaxed outline-none focus:border-mint"
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

/**
 * 발송 결과 — 소비자에게 도착한 잠금화면 푸시
 *
 * 사장님이 보낸 게 어떻게 도착하는지 한 화면에서 이어지게 한다.
 * 배경 이미지는 public/push-bg.png 로 교체하세요.
 */
function PushResult({
  body,
  store,
  onBack,
}: {
  body: string
  store: string
  onBack: () => void
}) {
  const now = new Date()
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const date = `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`

  return (
    <Phone>
      <div className="relative flex flex-1 flex-col">
        {/* 배경 — public/push-bg.png 를 넣으면 자동 적용 */}
        <div
          className="absolute inset-0 bg-[#FAF0D7] bg-cover bg-center"
          style={{ backgroundImage: `url(${PUSH_BG})` }}
          aria-hidden
        />

        <div className="relative flex flex-1 flex-col px-5 pt-16">
          <p className="text-center text-[52px] font-light leading-none">
            {time}
          </p>
          <p className="mt-2.5 text-center text-[14px]">{date}</p>

          <div className="mt-8 rounded-2xl bg-[#DFF0D0]/90 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-white text-[9px] font-bold text-mint">
                iM
              </span>
              <span className="text-[12px] font-semibold">iM Bank</span>
            </div>
            <p className="mt-2 text-[13px] font-semibold">
              대구 왔는교? 반갑데이!
            </p>
            <p className="mt-1 text-[13px] leading-relaxed">
              {store} — {body}
            </p>
          </div>
        </div>

        <div className="relative px-5 pb-6">
          <p className="mb-3 text-center text-[12px] leading-relaxed text-ink-sub">
            방문해서 결제가 일어나면
            <br />
            그때 수수료가 발생합니다
          </p>
          <button className="btn-primary" onClick={onBack}>
            대시보드로
          </button>
        </div>
      </div>
    </Phone>
  )
}
