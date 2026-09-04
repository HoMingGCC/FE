import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Phone, TabBar } from '@/components/Layout'
import { useAppStore } from '@/store/useAppStore'
import { fmtDate } from '@/lib/regular'

/**
 * 소식 피드
 *
 * 폐업 알림 · 금융 제안 · 가게 소식을 한 리스트에 섞는다.
 * 금융 제안을 별도 탭으로 빼면 광고함처럼 보여서 아무도 안 연다.
 * 폐업 알림 사이에 있어야 자연스럽게 눈에 들어온다.
 */

type FeedKind = 'closed' | 'finance' | 'store' | 'regular'

interface FeedItem {
  id: string
  kind: FeedKind
  title: string
  desc?: string
  meta: string
  unread: boolean
  to?: string
  cta?: string
}

const KIND_LABEL: Record<FeedKind, string> = {
  closed: '폐업',
  finance: '금융 제안',
  store: '가게 소식',
  regular: '단골 등극',
}

const DOT: Record<FeedKind, string> = {
  closed: 'bg-neutral-400',
  finance: 'bg-mint',
  store: 'bg-neutral-300',
  regular: 'bg-mint',
}

export function Feed() {
  const nav = useNavigate()
  const { regulars, journey } = useAppStore()

  const items = useMemo<FeedItem[]>(() => {
    const list: FeedItem[] = []

    // 폐업한 단골집
    for (const r of regulars.filter((x) => x.store.status === 'closed')) {
      list.push({
        id: `closed-${r.store.regno}`,
        kind: 'closed',
        title: `${r.store.name}가 문을 닫았어요`,
        desc: `${Math.floor(r.yearsSpan)}년 동안 ${r.visits}번 다니셨던 곳이에요`,
        meta: fmtDate(r.store.closedAt!),
        unread: true,
        to: `/store/${r.store.regno}`,
      })
    }

    // 금융 제안 — 결제 데이터에서 읽은 생애 이벤트
    list.push({
      id: 'finance-move',
      kind: 'finance',
      title: `${journey.label} 시기를 지나고 계시네요`,
      desc: '결제 지역이 바뀌었고, 가구·관리비가 처음 결제됐어요',
      meta: '오늘',
      unread: true,
      cta: `iM ${journey.products[0]} 알아보기`,
    })

    // 단골 등극
    const newest = regulars.find((r) => r.isRegular && r.store.status === 'open')
    if (newest) {
      list.push({
        id: `regular-${newest.store.regno}`,
        kind: 'regular',
        title: `${newest.store.name} 단골이 되셨어요`,
        desc: `${Math.floor(newest.yearsSpan)}년 만에 ${newest.threshold}번째 방문`,
        meta: '3일 전',
        unread: false,
        to: `/store/${newest.store.regno}`,
      })
    }

    // 가게 소식 — 실서비스에서는 사장님이 보낸 것
    const sender = regulars.find(
      (r) => r.store.status === 'open' && r.store.industry === '문구',
    )
    if (sender) {
      list.push({
        id: `store-${sender.store.regno}`,
        kind: 'store',
        title: `${sender.store.name} 새 소식`,
        desc: '오랜만에 오시면 노트 한 권 드려요',
        meta: '1주 전',
        unread: false,
        to: `/store/${sender.store.regno}`,
      })
    }

    return list
  }, [regulars, journey])

  return (
    <Phone>
      <header className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <h1 className="text-[17px] font-semibold">소식</h1>
        <button onClick={() => nav('/')} aria-label="홈" className="-m-1 p-1">
          <Icon name="home" />
        </button>
      </header>

      <ul className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-5">
        {items.map((it) => {
          const highlight = it.kind === 'finance' || it.kind === 'regular'
          return (
            <li key={it.id}>
              <button
                onClick={() => it.to && nav(it.to)}
                className={`w-full rounded-xl border p-3.5 text-left ${
                  highlight
                    ? 'border-mint-line bg-mint-light'
                    : 'border-line bg-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {it.unread && (
                    <span className={`size-1.5 rounded-full ${DOT[it.kind]}`} />
                  )}
                  <span
                    className={`text-[11px] ${highlight ? 'text-mint' : 'text-ink-mute'}`}
                  >
                    {KIND_LABEL[it.kind]} · {it.meta}
                  </span>
                </span>

                <span
                  className={`mt-1.5 block text-[14px] font-semibold ${
                    highlight ? 'text-mint' : 'text-ink'
                  }`}
                >
                  {it.title}
                </span>

                {it.desc && (
                  <span className="mt-1 block text-[12px] leading-relaxed text-ink-sub">
                    {it.desc}
                  </span>
                )}

                {it.cta && (
                  <span className="mt-3 block rounded-lg bg-mint py-2.5 text-center text-[13px] font-semibold text-white">
                    {it.cta}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <TabBar />
    </Phone>
  )
}
