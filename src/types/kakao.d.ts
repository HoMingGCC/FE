/// <reference types="vite/client" />

/**
 * 카카오맵 SDK 최소 타입 선언
 *
 * 공식 타입 패키지(kakao.maps.d.ts)를 설치해도 되지만,
 * 데모에서 쓰는 API가 몇 개 안 되므로 필요한 것만 선언한다.
 */
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void
        Map: new (container: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        LatLngBounds: new () => any
        CustomOverlay: new (options: any) => any
        event: {
          addListener: (target: any, type: string, cb: () => void) => void
        }
      }
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_KAKAO_KEY?: string
}

export {}