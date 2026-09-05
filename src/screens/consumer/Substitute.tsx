import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header, Phone } from '@/components/Layout'
import { STORES } from '@/mocks/stores'
import { useAppStore } from '@/store/useAppStore'
import { ruleOf } from '@/lib/ontology'

/**
 * 대체 가게 찾기
 *
 * 은행이 추천하지 않는다. 사용자가 고르고, 동의하면 익명으로 집계된다.
 * 그래야 "왜 우리 가게는 추천 안 하냐"는 공정성 민원이 안 생긴다.
 *
 * 후보는 두 곳에서 온다.
 *  1. 본인 결제 이력의 같은 업종  (내가 이미 가본 곳)
 *  2. 주변 검색                  (안 가본 곳 — 여기서는 목 데이터)
 *
 * 편의점처럼 대체가 자명한 업종은 이 기능을 제공하지 않는다 (ontology.substitutable).
 */
export function Substitute() {
  const { regno } = useParams()
  const nav = useNavigate()
  const [picked, setPicked] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const regulars = useAppStore((s) => s.regulars)
  const target = regulars.find((r) => r.store.regno === regno)

  if (!target) {
    return (
      <Phone>
        <Header title="대체 가게" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[13px] text-ink-mute">가게를 찾을 수 없어요</p>
        </div>
      </Phone>
    )
  }

  const industry = target.store.industry
  const rule = ruleOf(industry)

  if (!rule.substitutable) {
    return (
      <Phone>
        <Header title="대체 가게" />
        <div className="flex flex-1 items-center justify-center px-8">
          <p className="text-center text-[13px] leading-relaxed text-ink-sub">
            {industry}은 대체 가게를
            <br />
            추천하지 않아요
          </p>
        </div>
      </Phone>
    )
  }

  // 후보 — 같은 업종의 영업 중인 가게
  const candidates = STORES.filter(
    (s) =>
      s.industry === industry &&
      s.status === 'open' &&
      s.regno !== target.store.regno,
  )

  if (done) {
    return (
      <Phone>
        <Header title="대체 가게" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-mint-light">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00CBA5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </div>
          <p className="mt-5 text-[17px] font-bold">알려주셔서 고맙습니다</p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-sub">
            {target.store.name} 단골 6명이
            <br />
            지금 <b className="font-semibold text-mint">{picked}</b>에 갑니다
          </p>
          <p className="mt-4 rounded-xl bg-fill px-4 py-3 text-[11px] leading-relaxed text-ink-mute">
            누가 옮겼는지는 드러나지 않아요.
            <br />
            숫자로만 집계됩니다.
          </p>
          <button className="btn-primary mt-8" onClick={() => nav('/map')}>
            지도로 돌아가기
          </button>
        </div>
      </Phone>
    )
  }

  return (
    <Phone>
      <Header title="대체 가게" />

      <div className="flex flex-1 flex-col px-4 pb-6">
        <p className="text-[13px] text-ink-sub">
          {target.store.name}가 문을 닫았어요
        </p>
        <h2 className="mt-1 text-[17px] font-bold">
          {industry}는 요즘 어디서 구매하세요?
        </h2>

        <div className="mt-4 space-y-2">
          {candidates.map((c) => {
            const on = picked === c.name
            const visited = regulars.some((r) => r.store.regno === c.regno)
            return (
              <button
                key={c.regno}
                onClick={() => setPicked(c.name)}
                aria-pressed={on}
                className={`w-full rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  on ? 'border-mint bg-mint-light' : 'border-line'
                }`}
              >
                <span
                  className={`block text-[14px] font-medium ${on ? 'text-mint' : ''}`}
                >
                  {c.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-mute">
                  {visited ? '이미 가보신 곳이에요' : c.address.replace('대구 ', '')}
                </span>
              </button>
            )
          })}

          <button
            onClick={() => setPicked('none')}
            aria-pressed={picked === 'none'}
            className={`w-full rounded-xl border px-4 py-3.5 text-left text-[14px] transition-colors ${
              picked === 'none'
                ? 'border-mint bg-mint-light font-medium text-mint'
                : 'border-line text-ink-sub'
            }`}
          >
            아직 정한 곳이 없어요
          </button>
        </div>

        {picked && picked !== 'none' && (
          <div className="card-mint mt-5">
            <p className="text-[13px] font-semibold text-mint">
              같은 단골에게 익명으로 공유할까요?
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#4A8A7A]">
              {target.store.name}를 다니던 분들에게만 전해집니다
            </p>
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 rounded-lg bg-mint py-2.5 text-[13px] font-semibold text-white"
                onClick={() => setDone(true)}
              >
                공유
              </button>
              <button
                className="flex-1 rounded-lg border border-neutral-300 bg-white py-2.5 text-[13px] font-medium"
                onClick={() => nav('/map')}
              >
                나만 볼게요
              </button>
            </div>
          </div>
        )}

        {picked === 'none' && (
          <button className="btn-ghost mt-5" onClick={() => nav('/map')}>
            나중에 알려드릴게요
          </button>
        )}

        <p className="mt-auto pt-8 text-center text-[11px] leading-relaxed text-ink-mute">
          은행이 추천하는 것이 아니라
          <br />
          단골들이 알려주는 정보입니다
        </p>
      </div>
    </Phone>
  )
}
