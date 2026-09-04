import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from '@/components/Layout'
import { LOADING_STATS } from '@/mocks/payments'

/**
 * 지도 생성 로딩
 *
 * 시연에서 대체 불가능한 화면. 동의를 누르자마자 지도가 뜨면
 * "5년치를 진짜 불러온 건가?"가 남는다. 숫자가 올라가는 연출이 그 증거다.
 *
 * 첫 줄이 v1(지역화폐 = 동의 불필요)을 증명하는 자리이기도 하다.
 */

const DURATION = 3800

export function Loading() {
  const nav = useNavigate()
  const [progress, setProgress] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const started = Date.now()
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - started) / DURATION)
      // 끝으로 갈수록 느려지게
      const eased = 1 - Math.pow(1 - t, 2.2)
      setProgress(Math.round(eased * 100))
      setCount(Math.round(eased * LOADING_STATS.inRegion))
      if (t >= 1) {
        clearInterval(timer)
        setTimeout(() => nav('/map', { replace: true }), 500)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [nav])

  const steps = [
    {
      done: progress > 12,
      node: (
        <>
          <b className="font-semibold text-mint">
            지역화폐 {LOADING_STATS.localPayStores}곳
          </b>{' '}
          확인
        </>
      ),
    },
    {
      done: progress > 42,
      node: (
        <>
          {LOADING_STATS.totalNationwide.toLocaleString()}건 중 대구·경북{' '}
          <b className="font-semibold">{count}건</b>
        </>
      ),
    },
    {
      done: progress >= 100,
      node: <>가게 위치 찾는 중 <b className="font-semibold">{progress}%</b></>,
    },
  ]

  return (
    <Phone>
      <div className="px-4 py-3.5 text-[13px] text-ink-sub">지도 만드는 중</div>

      <div className="flex flex-1 flex-col justify-center px-6 pb-16">
        <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-full bg-mint-light">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00CBA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </div>

        <h1 className="text-center text-[19px] font-bold">
          결제 기록을 불러오고 있어요
        </h1>
        <p className="mt-1.5 text-center text-[13px] text-ink-mute">
          잠시만 기다려주세요
        </p>

        <ul className="mt-9 space-y-3.5" aria-live="polite">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2.5">
              {s.done ? (
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-mint">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                </span>
              ) : (
                <span className="size-[18px] shrink-0 rounded-full border-2 border-neutral-200" />
              )}
              <span className={`text-[14px] ${s.done ? 'text-ink' : 'text-ink-mute'}`}>
                {s.node}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-mint transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-7 rounded-xl bg-mint-light px-4 py-3 text-center text-[12px] leading-relaxed text-[#4A8A7A]">
          대구·경북 외 지역 결제는
          <br />
          가져오지 않습니다
        </p>
      </div>
    </Phone>
  )
}
