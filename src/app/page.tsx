import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import DashboardCharts from '@/components/DashboardCharts'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get totals
  const [{ count: userCount }, { count: imageCount }, { count: captionCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true })
  ])

  // 2. Get top 5 captions
  const { data: topCaptions } = await supabase
    .from('captions')
    .select(`
      id, content, like_count, images(url), profiles(email)
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
    .select(`profile_id, profiles(email)`)

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
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Dashboard Overview</h2>
          <p className="text-slate-400">Welcome to the Humor Study Data Center</p>
        </div>
        <div className="pb-2">
           <AuthButton user={user} />
        </div>
      </header>

        {/* Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Users', value: userCount, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
            { label: 'Total Images', value: imageCount, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
            { label: 'Total Captions', value: captionCount, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' }
          ].map(stat => (
            <div key={stat.label} className={`p-8 rounded-3xl border ${stat.bg} shadow-2xl backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-base font-bold text-slate-400 mb-2 uppercase tracking-widest">{stat.label}</h3>
              <p className={`text-6xl font-black ${stat.color} filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                {stat.value ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
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
    </div>
  )
}
