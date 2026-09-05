import { SendNews } from '@/screens/merchant/SendNews'
import { MerchantDashboard } from '@/screens/merchant/Dashboard'
import { MyPage } from '@/screens/consumer/MyPage'
import { Feed } from '@/screens/consumer/Feed'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Phone, TabBar } from '@/components/Layout'
import { Consent, PeriodSelect } from '@/screens/consumer/Consent'
import { Loading } from '@/screens/consumer/Loading'
import { MapHome } from '@/screens/consumer/MapHome'
import { StoreDetail } from '@/screens/consumer/StoreDetail'
import { useAppStore } from '@/store/useAppStore'
import type { Host } from '@/types'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route path="/onboard/consent" element={<Consent />} />
      <Route path="/onboard/period" element={<PeriodSelect />} />
      <Route path="/onboard/loading" element={<Loading />} />
      <Route path="/map" element={<MapHome />} />
      <Route path="/store/:regno" element={<StoreDetail />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/me" element={<MyPage />} />
      <Route path="/merchant" element={<MerchantDashboard />} />
      <Route path="/merchant/send" element={<SendNews />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/**
 * 진입 라우터
 *
 * 실서비스에서는 window.HoMingBridge로 host가 자동 판별되고 사용자에게 안 보인다.
 * 데모에서는 시연 편의를 위해 진입점을 직접 고를 수 있게 둔다.
 */
function Entry() {
  const nav = useNavigate()
  const setCtx = useAppStore((s) => s.setCtx)

  const paths: Array<{ host: Host; title: string; desc: string; to: string }> = [
    {
      host: 'imbank',
      title: 'iM뱅크에서 진입',
      desc: '단골 지도 · 마이데이터 · 금융상품 전환',
      to: '/onboard/consent',
    },
    {
      host: 'imshop',
      title: 'iM샵에서 진입',
      desc: '지역화폐 결제 이력으로 동의 없이 바로',
      to: '/map',
    },
    {
      host: 'web',
      title: 'QR · 링크로 진입',
      desc: '가입 없이 단골 보증 리스트 열람',
      to: '/map',
    },
  ]

  return (
    <Phone>
      <div className="flex flex-1 flex-col px-5 pb-8 pt-14">
        <p className="text-[13px] font-semibold text-mint">HoMing</p>
        <h1 className="mt-2 text-[22px] font-bold leading-snug">
          결제할 때마다 쌓이는
          <br />
          나만의 단골 지도
        </h1>
        <p className="mt-2 text-[13px] text-ink-sub">
          대구·경북 가맹점 방문 기록을 지도 위에서 찾아보세요
        </p>

        <p className="mt-9 text-[13px] font-medium text-ink-sub">
          어디서 들어오셨나요
        </p>
        <div className="mt-2.5 space-y-2.5">
          {paths.map((p) => (
            <button
              key={p.host}
              onClick={() => {
                setCtx({ host: p.host })
                nav(p.to)
              }}
              className="w-full rounded-xl border border-line px-4 py-3.5 text-left active:bg-neutral-50"
            >
              <span className="block text-[14px] font-semibold">{p.title}</span>
              <span className="mt-1 block text-[12px] text-ink-mute">
                {p.desc}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-auto pt-8 text-center text-[11px] text-ink-mute">
          데모용 진입점 선택 · 실서비스에서는 자동 판별됩니다
        </p>
      </div>
    </Phone>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <Phone>
      <header className="px-4 py-3.5">
        <h1 className="text-[17px] font-semibold">{title}</h1>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[13px] text-ink-mute">준비 중</p>
      </div>
      <TabBar />
    </Phone>
  )
}
