'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'

export default function DashboardCharts({ topUsers, imageStats }: { topUsers: any[], imageStats: any[] }) {
    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 pt-6 px-6 pb-10 rounded-2xl border border-slate-700"
            >
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Top Contributors (Captions)</h3>
                <div className="h-64">
                    {topUsers.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topUsers}>
                                <XAxis dataKey="email" stroke="#64748b" fontSize={12} tickFormatter={(val) => val.split('@')[0]} />
                                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">No data available</div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 pt-6 px-6 pb-10 rounded-2xl border border-slate-700"
            >
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Image Public vs Private</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={imageStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {imageStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    {imageStats.map((entry, index) => (
                        <div key={entry.name} className="flex gap-2 items-center text-xs text-slate-400">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            {entry.name}: {entry.value}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
