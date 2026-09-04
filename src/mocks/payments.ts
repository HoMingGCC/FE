import type { Payment, PaySource } from '@/types'
import { STORES } from './stores'

/**
 * 결제 원장 (합성) — 카드-008 / 선불-004 규격 형식에 맞춤
 *
 * 실서비스에서는 v1 지역화폐 자사 원장 → v2 당행 카드 → v3 타 카드사 마이데이터.
 * 데모는 전부 합성이지만 source 필드로 그 구분을 재현한다
 * (지도 하단 "지역화폐 8곳 · 카드 4곳" 표시에 사용).
 *
 * 방문 패턴 원칙:
 *  - 횟수를 27, 19, 14처럼 어중간하게 (30·20·10은 가짜 티가 남)
 *  - 방학·휴가철에 방문이 줄어드는 계절성
 *  - 취소 건 1~2개 섞기 (규칙 엔진이 제외하는 걸 보여주려면)
 */

interface Spec {
  regno: string
  visits: number
  from: string
  to: string
  avgAmount: number
  source: PaySource
}

const MAIN_USER = 'u-juyeon'

const SPECS: Spec[] = [
  // 지역화폐로 잡히는 곳 — 동의 없이 v1에서 이미 보이는 8곳
  { regno: '514-81-10001', visits: 27, from: '2021-03-15', to: '2025-11-20', avgAmount: 8_500, source: 'localpay' },
  { regno: '514-81-10002', visits: 19, from: '2021-04-11', to: '2025-08-02', avgAmount: 23_000, source: 'localpay' },
  { regno: '514-81-10003', visits: 14, from: '2021-03-02', to: '2024-11-08', avgAmount: 12_400, source: 'localpay' },
  { regno: '514-81-10004', visits: 24, from: '2022-01-20', to: '2025-10-14', avgAmount: 5_200, source: 'localpay' },
  { regno: '514-81-10009', visits: 11, from: '2021-09-04', to: '2025-05-17', avgAmount: 9_000, source: 'localpay' },
  { regno: '514-81-10010', visits: 9, from: '2022-03-19', to: '2025-06-21', avgAmount: 7_000, source: 'localpay' },
  { regno: '514-81-10011', visits: 7, from: '2021-11-30', to: '2025-02-09', avgAmount: 8_000, source: 'localpay' },
  { regno: '514-81-10012', visits: 6, from: '2023-05-12', to: '2025-09-27', avgAmount: 34_000, source: 'localpay' },

  // 카드 연결 후 추가되는 4곳 — v2/v3
  { regno: '514-81-10005', visits: 7, from: '2021-06-08', to: '2025-03-22', avgAmount: 148_000, source: 'im-card' },
  { regno: '514-81-10006', visits: 5, from: '2024-12-20', to: '2025-11-02', avgAmount: 11_000, source: 'im-card' },
  { regno: '514-81-10008', visits: 12, from: '2021-05-17', to: '2025-10-30', avgAmount: 42_000, source: 'other-card' },
  { regno: '514-81-10007', visits: 3, from: '2025-01-14', to: '2025-08-19', avgAmount: 9_800, source: 'other-card' },
]

/** 방학·휴가철 가중치 — 1·2·7·8월은 방문이 줄어든다 */
const SEASON_WEIGHT = [0.4, 0.5, 1.2, 1.1, 1.0, 1.0, 0.5, 0.4, 1.2, 1.1, 1.0, 0.9]

function spreadDates(from: string, to: string, count: number): Date[] {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  const out: Date[] = []
  let seed = 42

  for (let i = 0; i < count; i++) {
    // 결정적 의사난수 — 새로고침해도 같은 데이터가 나와야 시연이 안정적
    seed = (seed * 1103515245 + 12345) % 2147483648
    const jitter = (seed / 2147483648 - 0.5) * 0.6
    const ratio = Math.min(0.999, Math.max(0, (i + 0.5) / count + jitter / count))
    const d = new Date(start + (end - start) * ratio)
    // 계절 가중치로 한 번 더 흔들기
    const w = SEASON_WEIGHT[d.getMonth()]
    d.setDate(d.getDate() + Math.round((w - 1) * 12))
    out.push(d)
  }
  return out.sort((a, b) => a.getTime() - b.getTime())
}

function build(): Payment[] {
  const rows: Payment[] = []
  let n = 0

  for (const spec of SPECS) {
    const store = STORES.find((s) => s.regno === spec.regno)
    if (!store) continue

    for (const date of spreadDates(spec.from, spec.to, spec.visits)) {
      n += 1
      const wobble = 0.8 + ((n * 37) % 40) / 100
      rows.push({
        id: `p-${String(n).padStart(4, '0')}`,
        userId: MAIN_USER,
        merchantRegno: store.regno,
        merchantName: store.name,
        approvedAt: date.toISOString(),
        amount: Math.round((spec.avgAmount * wobble) / 100) * 100,
        payType: spec.source === 'localpay' ? 'prepaid' : 'check',
        status: 'approved',
        source: spec.source,
      })
    }
  }

  // 취소 건 — 규칙 엔진이 제외하는 걸 보여주기 위해
  rows.push({
    id: 'p-9001',
    userId: MAIN_USER,
    merchantRegno: '514-81-10001',
    merchantName: '봉덕 분식',
    approvedAt: '2024-07-13T12:10:00.000Z',
    amount: 9_000,
    payType: 'prepaid',
    status: 'canceled',
    source: 'localpay',
  })
  rows.push({
    id: 'p-9002',
    userId: MAIN_USER,
    merchantRegno: '514-81-10004',
    merchantName: '오늘의커피',
    approvedAt: '2025-02-28T09:40:00.000Z',
    amount: 5_500,
    payType: 'prepaid',
    status: 'canceled',
    source: 'localpay',
  })

  return rows.sort((a, b) => a.approvedAt.localeCompare(b.approvedAt))
}

export const PAYMENTS: Payment[] = build()

/** 로딩 화면에 띄울 숫자 — "1,284건 중 대구·경북 412건" */
export const LOADING_STATS = {
  totalNationwide: 1_284,
  inRegion: PAYMENTS.length,
  localPayStores: new Set(
    PAYMENTS.filter((p) => p.source === 'localpay').map((p) => p.merchantRegno),
  ).size,
}