// Server Component — ดึงตัวเลขจาก Supabase มาแสดงหน้าแรก
import { supabasePublic } from '@/lib/supabase/public'

type Stat = {
  id: string
  value: string
  label: string
  sort_order: number
}

export default async function Stats() {
  const { data: stats } = await supabasePublic
    .from('site_stats')
    .select('*')
    .order('sort_order', { ascending: true })

  if (!stats?.length) return null

  return (
    <section className="border-t border-white/10 bg-black py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 px-6 md:grid-cols-4">
        {(stats as Stat[]).map((s) => (
          <div key={s.id}>
            <div className="text-6xl font-extrabold leading-none text-white md:text-7xl">
              {s.value}
            </div>
            <div className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-orange-500 md:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
