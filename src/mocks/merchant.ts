import type { MerchantDashboard } from '@/types'
import { RANK_MIN_REGULARS, WEEKLY_SEND_SLOTS } from '@/lib/ontology'
import { storeByRegno } from './stores'

/**
 * 사장님 뷰 (합성)
 *
 * 소비자 축은 결제 원장 1명분에서 파생되지만, 사장님 화면의 "단골 12명"은
 * 손님 12명분이 있어야 나온다. 데모에서는 집계 결과만 합성한다.
 * (실서비스에서는 당행 결제 원장을 가게 단위로 집계)
 *
 * ⚠️ 단골 명단은 만들지 않는다. 손님 동의 없이 은행이 가맹점주에게
 *    고객 명단을 주는 게 되므로. 숫자만 보여준다.
 */

/** 지역화폐 가맹 + 당행 결제 — 정상 집계되는 가게 */
export const DASHBOARD_ACTIVE: MerchantDashboard = {
  store: storeByRegno('514-81-10001')!, // 봉덕 분식
  regularCount: 12,
  dormantCount: 3,
  newThisMonth: 2,
  rankThreshold: RANK_MIN_REGULARS,
  weeklySlotUsed: 1,
  weeklySlotTotal: WEEKLY_SEND_SLOTS,
}

/**
 * 미가맹 가게 — 단골 0명
 *
 * 발표 스크린샷은 이쪽을 쓴다. "0명"이 12명보다 강하다.
 * 우리 가게가 아예 안 보인다는 걸 눈으로 확인하게 되므로.
 */
export const DASHBOARD_EMPTY: MerchantDashboard = {
  store: storeByRegno('514-81-10005')!, // 큐 안경점 (localPayMerchant: false)
  regularCount: 0,
  dormantCount: 0,
  newThisMonth: 0,
  rankThreshold: RANK_MIN_REGULARS,
  weeklySlotUsed: 0,
  weeklySlotTotal: WEEKLY_SEND_SLOTS,
}

export const DASHBOARDS = [DASHBOARD_ACTIVE, DASHBOARD_EMPTY]

export function dashboardOf(regno: string) {
  return DASHBOARDS.find((d) => d.store.regno === regno) ?? DASHBOARD_ACTIVE
}

/** 소식 보내기 템플릿 — 자유 입력만 두면 검수 이슈가 생긴다 */
export const MESSAGE_TEMPLATES = [
  '오랜만에 오시면 음료 한 잔 서비스로 드려요',
  '이번 주 신메뉴가 나왔어요',
  '직접 입력할게요',
]