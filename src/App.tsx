import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Phone } from '@/components/Layout'
import { Consent, PeriodSelect } from '@/screens/consumer/Consent'
import { Loading } from '@/screens/consumer/Loading'
import { MapHome } from '@/screens/consumer/MapHome'
import { StoreDetail } from '@/screens/consumer/StoreDetail'
import { Substitute } from '@/screens/consumer/Substitute'
import { Community } from '@/screens/consumer/Community'
import { Feed } from '@/screens/consumer/Feed'
import { MyPage } from '@/screens/consumer/MyPage'
import { MerchantDashboard } from '@/screens/merchant/Dashboard'
import { SendNews } from '@/screens/merchant/SendNews'
import { VisitorList } from '@/screens/visitor/VisitorList'
import { VisitorStore, Join } from '@/screens/visitor/VisitorStore'
import { useAppStore } from '@/store/useAppStore'
import type { Host, Role } from '@/types'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />

      {/* 온보딩 */}
      <Route path="/onboard/consent" element={<Consent />} />
      <Route path="/onboard/period" element={<PeriodSelect />} />
      <Route path="/onboard/loading" element={<Loading />} />

      {/* 소비자 */}
      <Route path="/map" element={<MapHome />} />
      <Route path="/store/:regno" element={<StoreDetail />} />
      <Route path="/substitute/:regno" element={<Substitute />} />
      <Route path="/community" element={<Community />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/me" element={<MyPage />} />

      {/* 사장님 */}
      <Route path="/merchant" element={<MerchantDashboard />} />
      <Route path="/merchant/send" element={<SendNews />} />

      {/* 방문객 — VisitorList가 /visit/:regno 로 이동하므로 경로를 맞춘다 */}
      <Route path="/visit" element={<VisitorList />} />
      <Route path="/visit/:regno" element={<VisitorStore />} />
      <Route path="/join" element={<Join />} />

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

  const paths: Array<{
    host: Host
    role: Role
    title: string
    desc: string
    to: string
  }> = [
    {
      host: 'imbank',
      role: 'consumer',
      title: 'iM뱅크에서 진입',
      desc: '단골 지도 · 마이데이터 · 금융상품 전환',
      to: '/onboard/consent',
    },
    {
      host: 'imshop',
      role: 'merchant',
      title: 'iM샵에서 진입',
      desc: '사장님 모드 · 단골 현황 · 소식 보내기',
      to: '/merchant',
    },
    {
      host: 'web',
      role: 'consumer',
      title: 'QR · 링크로 진입',
      desc: '가입 없이 단골 보증 리스트 열람',
      to: '/visit',
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
              key={p.title}
              onClick={() => {
                setCtx({ host: p.host, activeRole: p.role })
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
