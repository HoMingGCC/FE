import type { Payment, PaySource, RegularStatus, Store } from '@/types'
import { ruleOf } from './ontology'

/**
 * 단골 판정 — 규칙 기반
 *
 * 확률 모델을 안 쓰는 이유: 화면에서 "미용실 기준 10회 · 현재 19회 → 인증"처럼
 * 근거를 그대로 보여줘야 하기 때문. 설명할 수 없는 판정은 뱃지가 될 수 없다.
 *
 * 취소 건은 제외한다.
 */

export function judge(store: Store, payments: Payment[]): RegularStatus | null {
  const rows = payments
    .filter((p) => p.merchantRegno === store.regno && p.status === 'approved')
    .sort((a, b) => a.approvedAt.localeCompare(b.approvedAt))

  if (rows.length === 0) return null

  const first = rows[0].approvedAt
  const last = rows[rows.length - 1].approvedAt
  const rule = ruleOf(store.industry)

  const spanMs = new Date(last).getTime() - new Date(first).getTime()
  const yearsSpan = Math.round((spanMs / (1000 * 60 * 60 * 24 * 365)) * 10) / 10

  // 최근 12개월 방문 분포 (미니 차트)
  const monthly = new Array(12).fill(0)
  const now = new Date(last)
  for (const p of rows) {
    const diff =
      (now.getFullYear() - new Date(p.approvedAt).getFullYear()) * 12 +
      (now.getMonth() - new Date(p.approvedAt).getMonth())
    if (diff >= 0 && diff < 12) monthly[11 - diff] += 1
  }

  // 이 가게를 잡아낸 주 경로 — 지역화폐가 하나라도 있으면 v1으로 본다
  const sources = new Set(rows.map((r) => r.source))
  const source: PaySource = sources.has('localpay')
    ? 'localpay'
    : sources.has('im-card')
      ? 'im-card'
      : 'other-card'

  return {
    store,
    visits: rows.length,
    firstVisit: first,
    lastVisit: last,
    totalAmount: rows.reduce((sum, p) => sum + p.amount, 0),
    threshold: rule.threshold,
    isRegular: rows.length >= rule.threshold,
    yearsSpan,
    monthlyVisits: monthly,
    source,
  }
}

export function judgeAll(stores: Store[], payments: Payment[]): RegularStatus[] {
  return stores
    .map((s) => judge(s, payments))
    .filter((r): r is RegularStatus => r !== null)
    .sort((a, b) => b.visits - a.visits)
}

/** 지도 하단 "지역화폐 8곳 · 카드 4곳" */
export function countBySource(list: RegularStatus[]) {
  return {
    localpay: list.filter((r) => r.source === 'localpay').length,
    card: list.filter((r) => r.source !== 'localpay').length,
    total: list.length,
  }
}

/** 단골까지 몇 번 남았는지 — "2번 남았어요" */
export function remainingToRegular(r: RegularStatus) {
  return Math.max(0, r.threshold - r.visits)
}

export function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function fmtWon(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}