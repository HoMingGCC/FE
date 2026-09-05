import { useEffect, useRef, useState } from 'react'
import type { RegularStatus } from '@/types'

/**
 * 카카오맵
 *
 * MapCanvas와 같은 인터페이스({ items, onPick })를 그대로 쓴다.
 * 그래서 MapHome은 import 한 줄만 바꾸면 된다.
 *
 * ⚠️ autoload=false 로 SDK를 불러왔으므로 반드시 kakao.maps.load() 콜백 안에서
 *    지도를 생성해야 한다. 로딩 전에 객체에 접근하면 에러가 난다.
 *
 * 핀은 CustomOverlay로 그린다. 기본 마커를 쓰면 "분식 27회" 라벨을 못 얹는데,
 * 그 숫자가 이 서비스의 정체성이라 포기할 수 없다.
 *
 * 클러스터링은 직접 계산한다. MarkerClusterer는 Marker만 묶을 수 있어
 * CustomOverlay와 같이 쓰기 어렵다. 지도 레벨에 따라 거리 임계값을 조절하면
 * 확대할수록 핀이 하나씩 풀린다.
 */

interface Props {
  items: RegularStatus[]
  onPick: (r: RegularStatus) => void
}

interface Cluster {
  lat: number
  lng: number
  items: RegularStatus[]
}

/** 지도 레벨에 따라 묶는 거리를 정한다 (레벨이 클수록 축소 상태) */
function thresholdOf(level: number) {
  return 0.0005 * Math.pow(2, level - 1)
}

function makeClusters(items: RegularStatus[], level: number): Cluster[] {
  const t = thresholdOf(level)
  const out: Cluster[] = []
  const used = new Set<string>()

  for (const a of items) {
    if (used.has(a.store.regno)) continue
    const group = [a]
    used.add(a.store.regno)

    for (const b of items) {
      if (used.has(b.store.regno)) continue
      const d = Math.hypot(a.store.lat - b.store.lat, a.store.lng - b.store.lng)
      if (d < t) {
        group.push(b)
        used.add(b.store.regno)
      }
    }

    out.push({
      lat: group.reduce((s, g) => s + g.store.lat, 0) / group.length,
      lng: group.reduce((s, g) => s + g.store.lng, 0) / group.length,
      items: group,
    })
  }
  return out
}

/** 개별 핀 */
function pinEl(r: RegularStatus, onPick: (r: RegularStatus) => void) {
  const el = document.createElement('button')
  const closed = r.store.status === 'closed'
  el.className = [
    'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium shadow-sm',
    closed ? 'bg-neutral-400 text-white' : 'bg-mint text-white',
  ].join(' ')
  el.textContent = `${r.store.industry} ${closed ? '폐업' : `${r.visits}회`}`
  el.addEventListener('click', () => onPick(r))
  return el
}

/** 묶인 핀 — 개수만 */
function clusterEl(c: Cluster, onZoom: (c: Cluster) => void) {
  const el = document.createElement('button')
  const size = 44 + c.items.length * 2
  el.className =
    'flex flex-col items-center justify-center rounded-xl bg-mint text-white shadow-md'
  el.style.width = `${size}px`
  el.style.height = `${size}px`
  el.setAttribute('aria-label', `이 구역 단골 ${c.items.length}곳`)
  el.innerHTML =
    `<span class="text-[15px] font-bold leading-none">${c.items.length}</span>` +
    `<span class="mt-0.5 text-[9px] leading-none opacity-90">곳</span>`
  el.addEventListener('click', () => onZoom(c))
  return el
}

export function KakaoMap({ items, onPick }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const overlaysRef = useRef<any[]>([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  // 지도 생성 — SDK 로딩이 끝난 뒤에만
  useEffect(() => {
    const kakao = window.kakao
    if (!kakao?.maps) {
      setFailed(true)
      return
    }

    kakao.maps.load(() => {
      if (!boxRef.current || mapRef.current) return

      const first = items[0]
      const map = new kakao.maps.Map(boxRef.current, {
        center: new kakao.maps.LatLng(
          first?.store.lat ?? 35.8714,
          first?.store.lng ?? 128.6014,
        ),
        level: 6,
      })
      mapRef.current = map

      // 모든 핀이 보이도록 범위 맞추기
      if (items.length > 1) {
        const bounds = new kakao.maps.LatLngBounds()
        for (const r of items) {
          bounds.extend(new kakao.maps.LatLng(r.store.lat, r.store.lng))
        }
        map.setBounds(bounds)
      }

      setReady(true)
    })
  }, [items])

  // 핀 다시 그리기 — 확대·이동할 때마다
  useEffect(() => {
    if (!ready) return
    const kakao = window.kakao
    const map = mapRef.current
    if (!kakao?.maps || !map) return

    function render() {
      for (const o of overlaysRef.current) o.setMap(null)
      overlaysRef.current = []

      const level = map.getLevel()
      const clusters = makeClusters(items, level)

      for (const c of clusters) {
        const single = c.items.length === 1
        const content = single
          ? pinEl(c.items[0], onPick)
          : clusterEl(c, (cl) => {
              map.setLevel(Math.max(1, map.getLevel() - 2), {
                anchor: new kakao!.maps.LatLng(cl.lat, cl.lng),
              })
            })

        const overlay = new kakao!.maps.CustomOverlay({
          position: new kakao!.maps.LatLng(c.lat, c.lng),
          content,
          yAnchor: 0.5,
          xAnchor: 0.5,
        })
        overlay.setMap(map)
        overlaysRef.current.push(overlay)
      }
    }

    render()
    kakao.maps.event.addListener(map, 'zoom_changed', render)
    kakao.maps.event.addListener(map, 'idle', render)
  }, [ready, items, onPick])

  if (failed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#F2F2F2] px-8 text-center">
        <p className="text-[13px] font-medium">지도를 불러오지 못했어요</p>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-mute">
          .env의 VITE_KAKAO_KEY와
          <br />
          카카오 개발자 사이트의 도메인 등록을 확인해주세요
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex-1">
      <div ref={boxRef} className="absolute inset-0" />
      <button
        onClick={() => {
          const kakao = window.kakao
          const map = mapRef.current
          if (!kakao?.maps || !map || items.length < 2) return
          const bounds = new kakao.maps.LatLngBounds()
          for (const r of items) {
            bounds.extend(new kakao.maps.LatLng(r.store.lat, r.store.lng))
          }
          map.setBounds(bounds)
        }}
        className="absolute bottom-3 left-3 z-10 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium shadow-sm"
      >
        전체 보기
      </button>
    </div>
  )
}
