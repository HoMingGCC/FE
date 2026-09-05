import type { Category, DistrictRanking } from '@/types'
import { storeByRegno } from './stores'

/**
 * 방문객 뷰 (합성) — 상권 단위 랭킹
 *
 * 소비자 축은 결제 원장 1명분에서 파생되지만, "단골 84명"은 손님 84명분이
 * 있어야 나온다. 데모에서는 집계 결과만 합성한다.
 *
 * 배분 원칙: 전체 탭에서 카테고리를 섞는다.
 * 5개가 전부 밥이면 "다 안 당기네"로 끝나기 때문.
 */

interface RankRow {
  regno: string
  regularCount: number
  avgYears: number
  recent6mVisitors: number
  walkMinutes: number
  isOpenNow: boolean
}

const SEOMUN_ROWS: RankRow[] = [
  { regno: '514-81-10009', regularCount: 84, avgYears: 4.1, recent6mVisitors: 62, walkMinutes: 2, isOpenNow: true }, // 옛집 손칼국수 · 밥
  { regno: '514-81-10010', regularCount: 61, avgYears: 3.6, recent6mVisitors: 44, walkMinutes: 4, isOpenNow: true }, // 서문 옛맛 만두 · 밥
  { regno: '514-81-10011', regularCount: 47, avgYears: 3.2, recent6mVisitors: 38, walkMinutes: 6, isOpenNow: true }, // 진골목 팥죽 · 디저트
  { regno: '514-81-10012', regularCount: 22, avgYears: 2.4, recent6mVisitors: 17, walkMinutes: 5, isOpenNow: true }, // 큰장 막창 · 술
]

/** QR URL의 상권 코드로 조회 — GPS 아님 */
export const RANKINGS: Record<string, DistrictRanking> = {
  seomun: {
    districtCode: 'seomun',
    districtName: '서문시장',
    items: SEOMUN_ROWS.map((r) => ({
      store: storeByRegno(r.regno)!,
      regularCount: r.regularCount,
      avgYears: r.avgYears,
      recent6mVisitors: r.recent6mVisitors,
      walkMinutes: r.walkMinutes,
      isOpenNow: r.isOpenNow,
    })),
  },
}

export function rankingOf(code: string) {
  return RANKINGS[code] ?? RANKINGS.seomun
}

/** 상권별 환영 인사 — 특정 가게를 지목하면 발신자가 불분명해진다 */
export const WELCOME: Record<string, { title: string; body: string }> = {
  seomun: {
    title: '대구 왔는교? 반갑데이!',
    body: '서문시장 한 바퀴 돌고 가이소',
  },
}

/** 방문객 리스트 카테고리 탭 */
export const VISITOR_TABS: Array<{ key: Category | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'meal', label: '밥' },
  { key: 'cafe', label: '간식·디저트' },
  { key: 'drink', label: '술' },
]