import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Header, Icon, Phone } from '@/components/Layout'
import { rankingOf } from '@/mocks/visitor'

/**
 * 방문객용 가게 상세
 *
 * "단골 47명"만으로는 별점 4.5와 다르지 않게 들린다.
 * "평균 3.2년째"와 "최근 6개월 38명"이 있어야 리뷰로는 못 만드는 숫자가 된다.
 * 별점은 한 번 가고도 쓸 수 있지만 3.2년은 못 만든다.
 */
export function VisitorStore() {
  const { regno } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const code = params.get('d') ?? 'seomun'

  const item = rankingOf(code).items.find((i) => i.store.regno === regno)

  if (!item) {
    return (
      <Phone>
        <Header title="가게 정보" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[13px] text-ink-mute">가게를 찾을 수 없어요</p>
        </div>
      </Phone>
    )
  }

  const s = item.store

  return (
    <Phone>
      <Header title={s.name} />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex h-28 items-center justify-center rounded-xl bg-neutral-100">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00CBA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </div>

        <p className="mt-5 text-center text-[19px] font-bold">
          결제로 증명된 단골 {item.regularCount}명
        </p>
        <p className="mt-2 text-center text-[13px] text-ink-sub">
          평균 {item.avgYears}년째 다니는 중
        </p>
        <p className="mt-0.5 text-center text-[13px] text-ink-sub">
          최근 6개월 {item.recent6mVisitors}명 방문
        </p>

        <p className="mt-4 rounded-xl bg-fill px-4 py-3 text-center text-[12px] text-ink-mute">
          리뷰가 아닙니다. 실제 결제 기록입니다.
        </p>

        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[13px]">
          <Row label="영업시간" value={s.hours ?? '정보 없음'} />
          <Row label="휴무" value={s.holiday ?? '정보 없음'} />
          <Row label="위치" value={s.address.replace('대구 ', '')} />
        </dl>

        <button className="btn-ghost mt-5">길찾기</button>

        <div className="card-mint mt-5">
          <p className="text-[15px] font-semibold text-mint">
            당신의 단골집은 어디인가요?
          </p>
          <p className="mt-1 text-[12px] text-ink-sub">
            카드 결제 기록으로 만들어드려요
          </p>
          <button className="btn-primary mt-3.5" onClick={() => nav('/join')}>
            내 단골 지도 만들기
          </button>
        </div>
      </div>
    </Phone>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink-sub">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

/**
 * 지도 만들기 갈림길
 *
 * 이 화면에 오는 사람은 대부분 iM 고객이 아니다 (앱이 있으면 여기까지 안 옴).
 * 그래서 신규를 위에, 강한 버튼으로 둔다.
 *
 * 버튼 문구에서 "계좌"를 빼고 "지도"로 — 이 사람은 지도를 만들고 싶은 것이지
 * 계좌를 만들고 싶은 게 아니다. 계좌는 설명으로 내린다.
 */
export function Join() {
  const nav = useNavigate()

  const preview = [
    { label: '분식 27회', x: 12, y: 18 },
    { label: '미용실 19회', x: 44, y: 52 },
    { label: '카페 24회', x: 18, y: 74 },
  ]

  return (
    <Phone>
      <Header title="나만의 단골 지도 만들기" />

      <div className="flex flex-1 flex-col px-4 pb-6">
        <p className="text-[13px] text-ink-sub">
          결제 내역으로 대구·경북 단골 가게를 한눈에 확인하세요
        </p>

        <div className="relative mt-3 h-32 overflow-hidden rounded-xl bg-neutral-100">
          {preview.map((p) => (
            <span
              key={p.label}
              className="absolute rounded-md bg-mint px-2 py-1 text-[10px] font-medium text-white"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.label}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-ink-mute">
          이런 지도가 만들어져요
        </p>

        <div className="card mt-4">
          <p className="text-[13px] font-semibold">처음이에요</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-sub">
            계좌를 만들면 5분 안에 지도가 완성돼요. 비대면으로 진행됩니다.
          </p>
          <button
            className="btn-primary mt-3"
            onClick={() => nav('/onboard/consent')}
          >
            5분만에 지도 만들기
          </button>
        </div>

        <div className="card mt-2.5">
          <p className="text-[13px] font-semibold">이미 iM 고객이에요</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-sub">
            iM뱅크·iM샵 계정으로 로그인하면 바로 시작할 수 있어요.
          </p>
          <button
            className="btn-ghost mt-3"
            onClick={() => nav('/onboard/consent')}
          >
            로그인하고 시작하기
          </button>
        </div>

        <p className="mt-auto pt-6 text-center text-[11px] leading-relaxed text-ink-mute">
          마이데이터 연동에 본인인증이 포함되어 있어
          <br />
          별도 가입은 필요하지 않아요
        </p>
      </div>
    </Phone>
  )
}
