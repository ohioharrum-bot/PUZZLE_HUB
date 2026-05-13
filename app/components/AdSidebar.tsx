import AdBanner from '@/components/AdBanner'

export default function AdSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-[26px] border border-black/10 bg-white/45 p-3 shadow-sm backdrop-blur">
        <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-black/35">
          Sponsored
        </p>
        <AdBanner
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR!}
          format="vertical"
          className="m-0 min-h-[420px] shadow-none"
        />
      </div>
    </aside>
  )
}
