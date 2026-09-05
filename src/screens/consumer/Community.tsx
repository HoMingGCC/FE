import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header, Phone } from '@/components/Layout'
import { REVIEWS, type Review } from '@/mocks/reviews'
import { useAppStore } from '@/store/useAppStore'

/**
 * 커뮤니티
 *
 * 결제로 인증된 단골만 글을 남길 수 있다. 그래서 가입이 필요 없다 —
 * 이미 결제 기록이 신원을 대신한다.
 *
 * 별점이 없는 이유: 평가가 아니라 관계를 남기는 곳이라서.
 * 방문 횟수와 단골 일수가 그 자체로 신뢰 근거가 된다.
 *
 * 사진은 텍스트 아래에 둔다. 위로 올리면 인스타처럼 보이고
 * "단골 인증"이라는 정체성이 묻힌다.
 */
export function Community() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const regulars = useAppStore((s) => s.regulars)

  const [reviews, setReviews] = useState<Review[]>(REVIEWS)
  const [writing, setWriting] = useState(params.get('write') === '1')

  // 내가 단골로 인증된 가게만 리뷰를 쓸 수 있다
  const writable = regulars.filter(
    (r) => r.isRegular && r.store.status === 'open',
  )
  const [target, setTarget] = useState(writable[0]?.store.regno ?? '')
  const [body, setBody] = useState('')
  const [photos, setPhotos] = useState(0)

  function submit() {
    const picked = writable.find((r) => r.store.regno === target)
    if (!picked || !body.trim()) return
    setReviews((prev) => [
      {
        id: `r-${Date.now()}`,
        author: '주연',
        isMe: true,
        storeName: picked.store.name,
        body: body.trim(),
        visits: picked.visits,
        daysAsRegular: Math.round(picked.yearsSpan * 365),
        photos,
      },
      ...prev,
    ])
    setBody('')
    setPhotos(0)
    setWriting(false)
  }

  return (
    <Phone>
      <Header title="커뮤니티" />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="card-fill">
          <p className="text-[14px] font-semibold text-mint">가입은 필요 없어요</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-sub">
            결제 기록으로 단골 인증된 사람만 여기 모여있어요.
            <br />
            글은 그 가게의 진짜 단골만 직접 남길 수 있어요.
          </p>
        </div>

        {writing ? (
          <div className="card-fill mt-3">
            <p className="text-[12px] text-ink-sub">
              내가 단골로 인증된 가게에서만 고를 수 있어요
            </p>

            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-mint"
            >
              {writable.map((r) => (
                <option key={r.store.regno} value={r.store.regno}>
                  {r.store.name} ({r.visits}회 방문)
                </option>
              ))}
            </select>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={80}
              placeholder="이 가게에 대한 한 줄, 직접 남겨주세요"
              className="mt-2 h-20 w-full resize-none rounded-lg border border-line bg-white p-3 text-[13px] outline-none focus:border-mint"
            />

            <p className="mt-3 text-[11px] text-ink-sub">
              사진 <span className="text-ink-mute">(선택 · 최대 3장)</span>
            </p>
            <div className="mt-1.5 flex gap-1.5">
              <button
                onClick={() => setPhotos((n) => Math.min(3, n + 1))}
                aria-label="사진 추가"
                className="flex size-14 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A4A4A4" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              {Array.from({ length: photos }).map((_, i) => (
                <span key={i} className="size-14 rounded-lg bg-neutral-200" />
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setWriting(false)}
                className="flex-1 rounded-lg bg-neutral-200 py-2.5 text-[13px] text-ink-sub"
              >
                취소
              </button>
              <button
                onClick={submit}
                disabled={!body.trim()}
                className="flex-1 rounded-lg bg-mint py-2.5 text-[13px] font-semibold text-white disabled:bg-neutral-200 disabled:text-ink-mute"
              >
                등록하기
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setWriting(true)}
            disabled={writable.length === 0}
            className="mt-3 w-full rounded-xl bg-[#FDF6E3] py-3.5 text-[13px] font-semibold disabled:text-ink-mute"
          >
            {writable.length ? '+ 내 단골집에 리뷰 남기기' : '아직 인증된 단골집이 없어요'}
          </button>
        )}

        <ul className="mt-3 space-y-2.5">
          {reviews.map((rv) => (
            <li key={rv.id} className="card">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-mint text-[10px] font-semibold text-white">
                  {rv.author[0]}
                </span>
                <span className="text-[13px] font-semibold">
                  {rv.author}
                  {rv.isMe && ' (나)'}
                </span>
                <span className="rounded bg-[#FDF6E3] px-1.5 py-0.5 text-[10px] font-medium text-[#8A6D3B]">
                  단골 인증
                </span>
                <span className="text-[11px] text-ink-mute">{rv.storeName}</span>
              </div>

              <p className="mt-2 text-[13px] leading-relaxed">{rv.body}</p>

              {rv.photos > 0 && (
                <div className="mt-2.5 flex gap-1.5">
                  {Array.from({ length: rv.photos }).map((_, i) => (
                    <span key={i} className="size-14 rounded-lg bg-neutral-100" />
                  ))}
                </div>
              )}

              <p className="mt-2 text-[11px] text-ink-mute">
                {rv.visits}회 방문 · {rv.daysAsRegular}일째 단골
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-ink-mute">
          결제로 인증된 단골만 글을 남길 수 있어
          <br />
          별점이나 조작 리뷰가 없습니다
        </p>
      </div>
    </Phone>
  )
}
