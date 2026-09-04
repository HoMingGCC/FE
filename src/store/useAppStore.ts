import { create } from 'zustand'
import type { BridgeContext, JourneyState, PaySource, RegularStatus } from '@/types'
import { STORES } from '@/mocks/stores'
import { PAYMENTS } from '@/mocks/payments'
import { judgeAll } from '@/lib/regular'

export type Period = '1y' | 'campus' | '5y'

interface ConsentState {
  merchantInfo: boolean // 가맹점명·사업자번호 조회
  approvals5y: boolean // 최근 5년 승인내역
  marketing: boolean // 마케팅 정보 수신
}

interface AppState {
  // 웹뷰 컨텍스트
  ctx: BridgeContext
  setCtx: (c: Partial<BridgeContext>) => void

  // 온보딩
  consent: ConsentState
  toggleConsent: (k: keyof ConsentState) => void
  period: Period
  setPeriod: (p: Period) => void

  // 데이터
  linked: PaySource[] // 연결된 데이터 원천
  regulars: RegularStatus[]
  buildMap: () => void
  linkCards: () => void

  // 금융 여정
  journey: JourneyState
}

/** v1 — 지역화폐는 당행 자사 원장이라 동의 없이 이미 보인다 */
const V1_ONLY: PaySource[] = ['localpay']
const ALL_SOURCES: PaySource[] = ['localpay', 'im-card', 'other-card']

function regularsFor(sources: PaySource[]) {
  const rows = PAYMENTS.filter((p) => sources.includes(p.source))
  const regnos = new Set(rows.map((r) => r.merchantRegno))
  return judgeAll(
    STORES.filter((s) => regnos.has(s.regno)),
    rows,
  )
}

export const useAppStore = create<AppState>((set, get) => ({
  ctx: {
    host: 'imbank',
    authToken: null,
    roles: ['consumer'],
    activeRole: 'consumer',
    homeRegion: 'daegu',
    merchantIds: ['514-81-10001'],
  },
  setCtx: (c) => set((s) => ({ ctx: { ...s.ctx, ...c } })),

  consent: { merchantInfo: true, approvals5y: true, marketing: true },
  toggleConsent: (k) =>
    set((s) => ({ consent: { ...s.consent, [k]: !s.consent[k] } })),

  period: 'campus',
  setPeriod: (p) => set({ period: p }),

  // iM샵 진입은 동의 없이 v1이 이미 있는 상태로 시작
  linked: V1_ONLY,
  regulars: regularsFor(V1_ONLY),

  buildMap: () => {
    const linked = ALL_SOURCES
    set({ linked, regulars: regularsFor(linked) })
  },

  linkCards: () => {
    const linked = ALL_SOURCES
    set({ linked, regulars: regularsFor(linked) })
  },

  journey: {
    stage: 'move',
    label: '이주·자취',
    products: ['전월세 대출', '주거래우대예금'],
  },
}))

export const useRegular = (regno: string) =>
  useAppStore((s) => s.regulars.find((r) => r.store.regno === regno))