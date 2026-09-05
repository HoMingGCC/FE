import { useNavigate } from 'react-router-dom'
import type { RegularStatus } from '@/types'

/**
 * 단골 등극 모달
 *
 * 별도 화면이 아니라 지도 위에 뜨는 모달. 한 번 보고 닫는 것이라
 * 프레임을 따로 만들면 플로우에서 붕 뜬다.
 *
 * "3년 4개월 만에 10번째 방문" — 쌓여서 도달했다는 게 이 서비스의 정체성이다.
 */
export function RegularAchieved({
  item,
  onClose,
}: {
  item: RegularStatus
  onClose: () => void
}) {
  const nav = useNavigate()

  const months = Math.round(item.yearsSpan * 12)
  const y = Math.floor(months / 12)
  const m = months % 12
  const span = m > 0 ? `${y}년 ${m}개월` : `${y}년`

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achieved-title"
    >
      <div className="relative w-full rounded-2xl bg-white px-6 py-8 text-center">
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3.5 top-3.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mx-auto flex size-[88px] items-center justify-center rounded-full border-[3px] border-lime bg-mint">
          <span className="text-[30px] font-bold text-white">
            {item.threshold}
          </span>
        </div>

        <p id="achieved-title" className="mt-5 text-[18px] font-bold leading-snug">
          {item.store.name}
          <br />
          단골이 되셨어요
        </p>
        <p className="mt-1.5 text-[13px] font-medium">
          {span} 만에 {item.threshold}번째 방문
        </p>

        <div className="mt-5 rounded-xl bg-fill px-4 py-3 text-left">
          <p className="text-[11px] text-ink-mute">이제 할 수 있는 것</p>
          <p className="mt-1.5 text-[12px] text-ink-sub">· 이 가게 리뷰 남기기</p>
          <p className="mt-0.5 text-[12px] text-ink-sub">· 가게 소식 받기</p>
        </div>

        <button
          className="btn-primary mt-5"
          onClick={() => nav(`/store/${item.store.regno}`)}
        >
          단골 인증 보기
        </button>
        <button
          onClick={onClose}
          className="mt-2.5 w-full py-1 text-[13px] text-ink-mute"
        >
          나중에 볼게요
        </button>
      </div>
    </div>
  )
}
