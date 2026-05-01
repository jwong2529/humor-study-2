'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'

export default function DashboardCharts({ topUsers, imageStats }: { topUsers: any[], imageStats: any[] }) {
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/40 backdrop-blur-md pt-8 px-8 pb-12 rounded-[2.5rem] border border-slate-700/50 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Top Contributors</h3>
                </div>
                <div className="h-72">
                    {topUsers.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis 
                                  dataKey="email" 
                                  stroke="#475569" 
                                  fontSize={10} 
                                  fontWeight={700}
                                  tickFormatter={(val) => val.split('@')[0]} 
                                  axisLine={false}
                                  tickLine={false}
                                  dy={10}
                                />
                                <YAxis 
                                  stroke="#475569" 
                                  fontSize={10} 
                                  fontWeight={700}
                                  allowDecimals={false} 
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip 
                                  cursor={{ fill: '#ffffff05' }} 
                                  contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155', 
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                  }} 
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill="#3b82f6" 
                                  radius={[6, 6, 0, 0]} 
                                  barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 font-medium italic">No performance data</div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/40 backdrop-blur-md pt-8 px-8 pb-12 rounded-[2.5rem] border border-slate-700/50 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Asset Distribution</h3>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={imageStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {imageStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: 'none', 
                                borderRadius: '16px',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                              }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-6 mt-8">
                    {imageStats.map((entry, index) => (
                        <div key={entry.name} className="flex gap-3 items-center">
                            <span className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{entry.name}</span>
                              <span className="text-sm font-bold text-slate-300 leading-none">{entry.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
