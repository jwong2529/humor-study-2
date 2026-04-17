'use client'

import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    LineChart, Line, CartesianGrid, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts'
import { motion } from 'framer-motion'

interface AnalyticsProps {
    flavorStats: any[]
    imageStats: any[]
    timeStats: any[]
}

export default function CaptionAnalyticsCharts({ flavorStats, imageStats, timeStats }: AnalyticsProps) {
    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Flavor Performance - Avg Likes */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Flavor Impact (Avg Likes)</h3>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                        <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                    </div>
                </div>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={flavorStats} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false}
                                axisLine={false}
                                width={80}
                            />
                            <Tooltip 
                                cursor={{ fill: '#ffffff05' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                            />
                            <Bar dataKey="avgLikes" radius={[0, 4, 4, 0]}>
                                {flavorStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Captions Over Time */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Creation Velocity (Last 14 Days)</h3>
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-500/20">Activity</div>
                </div>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeStats}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(val) => val.split('/')[1] + '/' + val.split('/')[0]} 
                            />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Total Likes Distribution by Flavor */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl"
            >
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 px-2">Likes Distribution</h3>
                <div className="h-[600px] flex flex-col items-center justify-between">
                    <div className="w-full flex-1 min-h-[400px] relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={flavorStats}
                                    innerRadius={110}
                                    outerRadius={170}
                                    paddingAngle={5}
                                    dataKey="totalLikes"
                                    cx="50%"
                                    cy="50%"
                                >
                                    {flavorStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 w-full px-4 pb-4">
                        {flavorStats.slice(0, 6).map((entry, index) => (
                            <div key={entry.name} className="flex gap-2 items-center text-[10px] text-slate-400">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="font-medium text-slate-300 capitalize truncate">{entry.name.replace('-', ' ')}</span>
                                <span className="text-slate-600 font-mono ml-auto">{entry.totalLikes}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Image Success Rate */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl"
            >
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Image Viral Potential</h3>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-700/30 px-3 py-1 rounded-full">Top 10 Images</span>
                </div>
                <div className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={imageStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{ fill: '#ffffff05' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                            />
                            <Bar dataKey="avgLikes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    )
}
