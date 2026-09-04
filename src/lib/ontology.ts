import type { Category } from '@/types'

/**
 * 업종별 단골 기준 (온톨로지)
 *
 * 코드가 아니라 데이터로 정의한다 — 기준이 바뀌어도 로직을 안 건드림.
 * 화면에서 "미용실 기준 10회 · 현재 8회"처럼 근거를 그대로 보여줄 수 있어야 하므로
 * 확률 모델이 아니라 규칙으로 간다.
 */

export interface IndustryRule {
  industry: string
  category: Category
  /** 이 횟수 이상이면 단골 */
  threshold: number
  /** 대체 가게 추천을 제공할지 — 편의점처럼 대체가 자명하면 false */
  substitutable: boolean
}

export const ONTOLOGY: Record<string, IndustryRule> = {
  분식: { industry: '분식', category: 'meal', threshold: 10, substitutable: true },
  한식: { industry: '한식', category: 'meal', threshold: 10, substitutable: true },
  국수: { industry: '국수', category: 'meal', threshold: 8, substitutable: true },
  만두: { industry: '만두', category: 'meal', threshold: 8, substitutable: true },
  카페: { industry: '카페', category: 'cafe', threshold: 15, substitutable: true },
  디저트: { industry: '디저트', category: 'cafe', threshold: 8, substitutable: true },
  주점: { industry: '주점', category: 'drink', threshold: 8, substitutable: true },
  미용실: { industry: '미용실', category: 'life', threshold: 10, substitutable: true },
  문구: { industry: '문구', category: 'life', threshold: 15, substitutable: true },
  안경점: { industry: '안경점', category: 'life', threshold: 2, substitutable: true },
  병원: { industry: '병원', category: 'life', threshold: 4, substitutable: false },
  약국: { industry: '약국', category: 'life', threshold: 6, substitutable: false },
  편의점: { industry: '편의점', category: 'life', threshold: 30, substitutable: false },
}

export function ruleOf(industry: string): IndustryRule {
  return (
    ONTOLOGY[industry] ?? {
      industry,
      category: 'life',
      threshold: 10,
      substitutable: false,
    }
  )
}

export const CATEGORY_LABEL: Record<Category, string> = {
  meal: '밥',
  cafe: '간식·디저트',
  drink: '술',
  life: '생활',
}

/** 방문객 리스트에 노출할 카테고리 (생활은 제외 — 관광객 대상 아님) */
export const VISITOR_CATEGORIES: Category[] = ['meal', 'cafe', 'drink']

/** 가맹점 랭킹 노출 최소 기준 — 이보다 적으면 재식별 위험 */
export const RANK_MIN_REGULARS = 20

/** 소식 발송 주간 총량 */
export const WEEKLY_SEND_SLOTS = 2