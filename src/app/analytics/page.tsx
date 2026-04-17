import { createClient } from '@/utils/supabase/server'
import DashboardCharts from '@/components/DashboardCharts'
import CaptionAnalyticsCharts from '@/components/CaptionAnalyticsCharts'
import AuthButton from '@/components/AuthButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch substantial data for analytics
    const { data: captions, error } = await supabase
        .from('captions')
        .select(`
            id, 
            content, 
            like_count, 
            created_datetime_utc,
            humor_flavor_id,
            humor_flavors(slug),
            image_id,
            images(url),
            profile_id,
            profiles!profile_id(email)
        `)
        .order('created_datetime_utc', { ascending: false })
        .limit(1000)

    if (error) {
        return <div className="p-8 text-red-500">Error loading analytics: {error.message}</div>
    }

    // Process data for statistics
    const totalLikes = captions?.reduce((acc, cap) => acc + (cap.like_count || 0), 0) || 0
    const avgLikes = captions?.length ? (totalLikes / captions.length).toFixed(2) : 0
    
    const wordCounts = captions?.map(cap => cap.content?.split(/\s+/).length || 0) || []
    const totalWords = wordCounts.reduce((acc, count) => acc + count, 0)
    const avgWords = wordCounts.length ? (totalWords / wordCounts.length).toFixed(1) : 0

    // Flavor Stats
    const flavorStatsMap: Record<string, { totalLikes: number, count: number, slug: string }> = {}
    captions?.forEach(cap => {
        const flavorData = cap.humor_flavors as any
        const flavor = (Array.isArray(flavorData) ? flavorData[0]?.slug : flavorData?.slug) || 'Unknown'
        if (!flavorStatsMap[flavor]) flavorStatsMap[flavor] = { totalLikes: 0, count: 0, slug: flavor }
        flavorStatsMap[flavor].totalLikes += (cap.like_count || 0)
        flavorStatsMap[flavor].count += 1
    })
    const flavorStats = Object.values(flavorStatsMap).map(f => ({
        name: f.slug,
        totalLikes: f.totalLikes,
        avgLikes: Number((f.totalLikes / f.count).toFixed(2)),
        count: f.count
    })).sort((a, b) => b.totalLikes - a.totalLikes)

    // Image Stats (Top Engage Images)
    const imageStatsMap: Record<string, { totalLikes: number, count: number, url: string }> = {}
    captions?.forEach(cap => {
        const imgId = cap.image_id || 'None'
        const imageData = cap.images as any
        const imageUrl = (Array.isArray(imageData) ? imageData[0]?.url : imageData?.url) || ''
        if (!imageStatsMap[imgId]) imageStatsMap[imgId] = { totalLikes: 0, count: 0, url: imageUrl }
        imageStatsMap[imgId].totalLikes += (cap.like_count || 0)
        imageStatsMap[imgId].count += 1
    })
    const imageStats = Object.values(imageStatsMap)
        .filter(i => i.count > 0)
        .map(i => ({
            name: i.url ? i.url.split('/').pop()?.substring(0, 10) : 'N/A',
            totalLikes: i.totalLikes,
            avgLikes: Number((i.totalLikes / i.count).toFixed(2)),
            fullUrl: i.url
        }))
        .sort((a, b) => b.avgLikes - a.avgLikes)
        .slice(0, 10)

    // Time Stats (Daily)
    const timeStatsMap: Record<string, number> = {}
    captions?.forEach(cap => {
        const date = new Date(cap.created_datetime_utc).toLocaleDateString()
        timeStatsMap[date] = (timeStatsMap[date] || 0) + 1
    })
    const timeStats = Object.entries(timeStatsMap).map(([date, count]) => ({
        date,
        count
    })).reverse().slice(-14) // Last 14 days with data

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-black tracking-tight text-white mb-2">Caption Analytics</h2>
                    <p className="text-slate-400">Deep dive into humor performance and user engagement</p>
                </div>
                <AuthButton user={user} />
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                    { label: 'Total Analyzed', value: captions?.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
                    { label: 'Average Likes', value: avgLikes, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
                    { label: 'Average Words', value: avgWords, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
                    { label: 'Total Likes', value: totalLikes, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' }
                ].map(stat => (
                    <div key={stat.label} className={`p-10 rounded-[2.5rem] border ${stat.bg} backdrop-blur-md relative overflow-hidden group shadow-2xl`}>
                        <h3 className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">{stat.label}</h3>
                        <p className={`text-6xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Detailed Charts */}
            <CaptionAnalyticsCharts 
                flavorStats={flavorStats} 
                imageStats={imageStats}
                timeStats={timeStats}
            />

            {/* Notable Mentions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <section className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 p-10 shadow-2xl">
                    <h3 className="text-[11px] font-black text-slate-500 mb-10 uppercase tracking-[0.3em]">Top Performers by Flavor</h3>
                    <div className="space-y-6">
                        {flavorStats.slice(0, 5).map((f, i) => (
                            <div key={f.name} className="flex items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-slate-700/30 hover:border-blue-500/30 shadow-lg transition-all group">
                                <div className="flex items-center gap-6">
                                    <span className="w-10 h-10 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-2xl font-black text-sm group-hover:scale-110 transition-transform">#{i+1}</span>
                                    <div>
                                        <p className="text-base font-bold text-white capitalize">{f.name.replace('-', ' ')}</p>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{f.count} captions submitted</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-pink-400">{f.avgLikes} avg</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{f.totalLikes} total likes</p>
                                </div>
                            </div>
                        ))}
                    </div>
               </section>

               <section className="bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 p-10 shadow-2xl">
                    <h3 className="text-[11px] font-black text-slate-500 mb-10 uppercase tracking-[0.3em]">Image Engagement Leaderboard</h3>
                    <div className="space-y-6">
                        {imageStats.slice(0, 5).map((img, i) => (
                            <div key={img.name} className="flex items-center gap-6 p-4 bg-slate-900/50 rounded-3xl border border-slate-700/30 shadow-lg group">
                                <div className="w-24 h-16 bg-black rounded-xl overflow-hidden shrink-0 border border-slate-800">
                                    <img src={img.fullUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-mono text-slate-500 truncate mb-2">{img.name}...</p>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full" 
                                            style={{ width: `${Math.min(100, (img.avgLikes / (imageStats[0].avgLikes || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-right pr-2">
                                    <span className="text-xl font-black text-emerald-400">{img.avgLikes}</span>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-[10px]">Score</p>
                                </div>
                            </div>
                        ))}
                    </div>
               </section>
            </div>
        </div>
    )
}
