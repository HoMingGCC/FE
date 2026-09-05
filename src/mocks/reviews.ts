export interface Review {
  id: string
  author: string
  isMe: boolean
  storeName: string
  body: string
  visits: number
  daysAsRegular: number
  photos: number // 첨부 장수 — 이미지는 회색 박스로 표시
}

/**
 * 커뮤니티 (합성)
 *
 * 결제로 인증된 단골만 글을 남길 수 있다.
 * 별점이 없는 이유: 평가가 아니라 관계를 남기는 곳이기 때문.
 * 방문 횟수와 단골 일수가 그 자체로 신뢰 근거가 된다.
 */
export const REVIEWS: Review[] = [
  {
    id: 'r1',
    author: '주연',
    isMe: true,
    storeName: '봉덕 분식',
    body: '4년 내내 여기만 갔어요. 졸업하고도 생각나는 맛.',
    visits: 27,
    daysAsRegular: 1710,
    photos: 2,
  },
  {
    id: 'r2',
    author: '창민',
    isMe: false,
    storeName: '가나 미용실',
    body: '자주는 못 가도 늘 여기로 돌아가게 돼요.',
    visits: 19,
    daysAsRegular: 1210,
    photos: 0,
  },
  {
    id: 'r3',
    author: '재현',
    isMe: false,
    storeName: '오늘의커피',
    body: '과제할 때마다 여기 아메리카노. 인생 카페.',
    visits: 24,
    daysAsRegular: 1380,
    photos: 1,
  },
  {
    id: 'r4',
    author: '주희',
    isMe: false,
    storeName: '큐 안경점',
    body: '안경 맞출 때마다 여기서. 설명을 정말 잘해주세요.',
    visits: 7,
    daysAsRegular: 1380,
    photos: 0,
  },
  {
    id: 'r5',
    author: '재영',
    isMe: false,
    storeName: '대현문구',
    body: '학기 시작마다 여기서 다이어리 샀어요.',
    visits: 5,
    daysAsRegular: 320,
    photos: 1,
  },
]