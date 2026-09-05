import { useEffect, useState } from 'react'

/**
 * 시연 안내 툴팁
 *
 * 발표 때 "여기를 눌러보세요"를 화면이 대신 알려준다.
 * 처음 진입 시 잠깐 떴다가 사라지고, 한 번 닫으면 그 화면에서는 다시 안 뜬다.
 *
 * 실서비스에는 없는 요소이므로 DemoHint 라는 이름을 그대로 둔다.
 */
export function DemoHint({
  text,
  place = 'bottom',
  delay = 600,
}: {
  text: string
  /** 화면 어느 쪽에 붙일지 */
  place?: 'top' | 'bottom'
  delay?: number
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
  const t = setTimeout(() => setShow(true), delay)
  const hide = setTimeout(() => setShow(false), delay + 4000)
  return () => {
    clearTimeout(t)
    clearTimeout(hide)
  }
}, [delay])

  if (!show) return null

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-30 flex justify-center px-6 ${
        place === 'top' ? 'top-20' : 'bottom-24'
      }`}
    >
      <p className="animate-pulse rounded-full bg-black/60 px-4 py-2 text-[12px] font-medium text-white shadow-lg">
        {text}
      </p>
    </div>
  )
}
