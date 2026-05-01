import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import DashboardCharts from '@/components/DashboardCharts'
import { BarChart3, LayoutDashboard } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get totals and check authorization
  const [{ count: userCount }, { count: imageCount }, { data: allLikes }, { data: profile }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('like_count'),
    supabase.from('profiles').select('is_superadmin').eq('id', user?.id).single()
  ])

  if (!profile?.is_superadmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#0f172a]">
        <h1 className="text-4xl font-black text-white mb-4">Unauthorized</h1>
        <p className="text-slate-400 mb-8">You do not have administrative privileges to access this area.</p>
        <AuthButton user={user} />
      </div>
    )
  }

  const captionCount = allLikes?.length || 0
  const sumLikes = allLikes?.reduce((acc, cap) => acc + (cap.like_count || 0), 0) || 0
  const avgLikes = allLikes?.length ? (sumLikes / allLikes.length).toFixed(1) : 0

  // 2. Get top 5 captions
  const { data: topCaptions } = await supabase
    .from('captions')
    .select(`
      id, content, like_count, images(url), profiles!profile_id(email)
    `)
    .order('like_count', { ascending: false })
    .limit(5)

  // 3. Image stats (public vs private) for Pie Chart
  // We just fetch all images for simplicity in this admin dashboard
  const { data: allImages } = await supabase.from('images').select('is_public')
  let publicCount = 0, privateCount = 0
  allImages?.forEach(img => img.is_public ? publicCount++ : privateCount++)
  const imageStats = [
    { name: 'Public', value: publicCount },
    { name: 'Private', value: privateCount }
  ]

  // 4. Top users for Bar Chart
  const { data: allCaptionsWithProfiles } = await supabase
    .from('captions')
    .select(`profile_id, profiles!profile_id(email)`)

  const userCaptionCount: Record<string, { email: string, count: number }> = {}
  allCaptionsWithProfiles?.forEach(cap => {
    if (!cap.profile_id) return
    const profileData = cap.profiles as any
    const email = (Array.isArray(profileData) ? profileData[0]?.email : profileData?.email) || cap.profile_id
    if (!userCaptionCount[email]) userCaptionCount[email] = { email, count: 0 }
    userCaptionCount[email].count += 1
  })

  const topUsers = Object.values(userCaptionCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <main className="p-8 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Intelligence Dashboard</h1>
          </div>
          <p className="text-slate-400 font-medium ml-[3.75rem]">Real-time metrics and humor study heuristics</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">System Status</p>
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Operational
          </div>
        </div>
      </header>

        <DashboardCharts topUsers={topUsers} imageStats={imageStats} />

        {/* Top Captions Section */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest border-b border-slate-700/50 pb-4">Top 5 Captions (by likes)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {topCaptions?.map((cap: any, i) => (
              <div key={cap.id} className="bg-[#1e293b] rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors overflow-hidden flex flex-col shadow-xl">
                <div className="aspect-square bg-black relative">
                  {cap.images?.url ? (
                    <img src={cap.images.url} alt="Context" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 bg-yellow-500 text-yellow-950 font-black px-2 py-1 text-xs rounded-full shadow-lg">
                    #{i + 1}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-sm font-medium leading-relaxed italic text-white line-clamp-3">"{cap.content}"</p>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">By {cap.profiles?.email?.split('@')[0] || 'Unknown'}</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">♥ {cap.like_count} Likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!topCaptions?.length && <p className="text-slate-500 col-span-full">No captions yet.</p>}
          </div>
        </div>
    </main>
  )
}
