import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, Phone, TabBar } from '@/components/Layout'
import { useAppStore } from '@/store/useAppStore'
import type { PaySource } from '@/types'

/**
 * 마이페이지
 *
 * 금융 여정은 "현재 단계만" 보여준다.
 * 4단계를 전부 펼치면 20대 사용자가 "귀향 50대"까지 보게 되는데,
 * 은행이 내 인생을 다 계획해둔 것처럼 읽혀서 불쾌해질 수 있다.
 */

const CARD_LABEL: Record<PaySource, string> = {
  localpay: '대구로페이',
  'im-card': 'iM뱅크 체크카드',
  'other-card': '신한카드',
}

export function MyPage() {
  const nav = useNavigate()
  const { linked, journey } = useAppStore()
  const [moveAlert, setMoveAlert] = useState(true)

  const cards: PaySource[] = ['localpay', 'im-card', 'other-card']

  return (
    <Phone>
      <header className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <h1 className="text-[17px] font-semibold">마이페이지</h1>
        <button onClick={() => nav('/')} aria-label="홈" className="-m-1 p-1">
          <Icon name="home" />
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <Section title="계정">
          <div className="card flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-mint-light text-[14px] font-semibold text-mint">
              주
            </span>
            <span>
              <span className="block text-[14px] font-medium">장주연</span>
              <span className="mt-0.5 block text-[12px] text-ink-mute">
                juyeon@example.com
              </span>
            </span>
          </div>
        </Section>

        <Section title="마이데이터 연동">
          <div className="card space-y-2.5">
            {cards.map((c) => {
              const on = linked.includes(c)
              return (
                <div key={c} className="flex justify-between text-[13px]">
                  <span>{CARD_LABEL[c]}</span>
                  <span className={on ? 'font-medium text-mint' : 'text-ink-mute'}>
                    {on ? '연동 중' : '미연동'}
                  </span>
                </div>
              )
            })}
            <p className="border-t border-line pt-2.5 text-[11px] leading-relaxed text-ink-mute">
              동의 범위 · 결제 내역 수신 · 가맹점 정보 제공
              <br />
              다음 갱신일 2026.08.26
            </p>
          </div>
        </Section>

        <Section title="나의 금융 여정">
          <div className="card-mint">
            <p className="text-[12px] text-[#4A8A7A]">장주연님은</p>
            <p className="mt-1 text-[15px] font-semibold text-mint">
              {journey.label} 단계예요
            </p>
            <button className="mt-1.5 flex items-center gap-0.5 text-[12px] text-ink-sub">
              {journey.products.join(' · ')}
              <Icon name="right" className="!size-3.5" />
            </button>
          </div>
        </Section>

        <Section title="고향과 이어지기">
          <div className="space-y-2">
            <LinkRow
              title="고향에 미리 결제"
              desc="단골집에 결제해두면 부모님이 쓰세요"
            />
            <LinkRow
              title="고향사랑기부"
              desc="답례품을 대구로페이로 받을 수 있어요"
            />
          </div>
        </Section>

        <Section title="알림">
          <div className="card flex items-center justify-between gap-3">
            <span>
              <span className="block text-[13px] font-medium">
                이사·이주 감지 알림
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-mute">
                결제 지역 변화로 감지 · 위치는 추적하지 않아요
              </span>
            </span>
            <button
              role="switch"
              aria-checked={moveAlert}
              aria-label="이사·이주 감지 알림"
              onClick={() => setMoveAlert((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                moveAlert ? 'bg-mint' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                  moveAlert ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </Section>

        <Section title="개인정보 관리">
          <button className="card w-full text-left">
            <span className="block text-[13px] font-medium">
              마이데이터 철회 및 데이터 삭제
            </span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-mute">
              동의 철회 시 지도·방문 기록·알림 이력이 삭제됩니다
            </span>
          </button>
        </Section>
      </div>

      <TabBar />
    </Phone>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-2 text-[13px] font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function LinkRow({ title, desc }: { title: string; desc: string }) {
  return (
    <button className="card flex w-full items-center justify-between gap-3 text-left">
      <span>
        <span className="block text-[13px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[11px] text-ink-mute">{desc}</span>
      </span>
      <Icon name="right" className="shrink-0 text-ink-mute" />
    </button>
  )
}
