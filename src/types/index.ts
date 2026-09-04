// ─── 가게 마스터 (실서비스: 당행 가맹점 마스터 + 공공데이터) ───

export type Category = 'meal' | 'cafe' | 'drink' | 'life'

export interface Store {
  regno: string // 사업자등록번호 = PK
  name: string
  address: string
  lat: number
  lng: number
  industry: string // '분식' '미용실' '문구' — 온톨로지 매칭용
  category: Category
  status: 'open' | 'closed' // 국세청 사업자등록상태 조회 결과
  closedAt?: string
  localPayMerchant: boolean // 지역화폐 가맹 여부
  hours?: string
  holiday?: string
  region: 'daegu' | 'pohang'
  district: string // '북구' '중구'
}

// ─── 결제 원장 (실서비스: 카드-008 / 선불-004) ───

export type PaySource = 'localpay' | 'im-card' | 'other-card'

export interface Payment {
  id: string
  userId: string
  merchantRegno: string // Store.regno와 조인
  merchantName: string
  approvedAt: string // ISO
  amount: number
  payType: 'check' | 'credit' | 'prepaid'
  status: 'approved' | 'canceled'
  source: PaySource // v1/v2/v3 구분 + 지도 출처 표시용
}

// ─── 단골 판정 결과 ───

export interface RegularStatus {
  store: Store
  visits: number // 취소 제외 승인 건수
  firstVisit: string
  lastVisit: string
  totalAmount: number
  threshold: number // 업종별 기준 (온톨로지)
  isRegular: boolean
  yearsSpan: number // 3.2 같은 값
  monthlyVisits: number[] // 최근 12개월 미니 차트용
  source: PaySource // 이 가게를 잡아낸 주 경로
}

// ─── 사장님 뷰 ───

export interface MerchantDashboard {
  store: Store
  regularCount: number
  dormantCount: number // 6개월+ 미방문
  newThisMonth: number
  rankThreshold: number // 랭킹 노출 기준 (20)
  weeklySlotUsed: number
  weeklySlotTotal: number
}

// ─── 방문객 뷰 ───

export interface DistrictRanking {
  districtCode: string
  districtName: string
  items: Array<{
    store: Store
    regularCount: number
    avgYears: number
    recent6mVisitors: number
    walkMinutes: number
    isOpenNow: boolean
  }>
}

// ─── 금융 여정 ───

export type LifeStage = 'move' | 'settle' | 'support' | 'return'

export interface JourneyState {
  stage: LifeStage
  label: string // '이주·자취'
  products: string[] // ['전월세 대출', '주거래우대예금']
}

// ─── 웹뷰 컨텍스트 ───

export type Host = 'imbank' | 'imshop' | 'web'
export type Role = 'consumer' | 'merchant'

export interface BridgeContext {
  host: Host
  authToken: string | null
  roles: Role[]
  activeRole: Role
  homeRegion: 'daegu' | 'pohang' | null
  merchantIds: string[]
}