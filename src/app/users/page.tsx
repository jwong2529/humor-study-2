import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Users, ShieldCheck, Mail, Calendar, User as UserIcon } from 'lucide-react'

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const pageSize = 12
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const { data: profiles, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_datetime_utc', { ascending: false })
        .range(start, end)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <main className="p-8 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Profiles Directory</h1>
                    </div>
                    <p className="text-slate-400 font-medium ml-[3.75rem]">Managing system access and user entities ({totalCount} total profiles)</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-800/40 backdrop-blur-md p-2 rounded-2xl border border-slate-700/50 shadow-xl self-end">
                    <Link
                        href={`/users?page=${Math.max(1, page - 1)}`}
                        className={`p-2.5 rounded-xl bg-slate-700 hover:bg-blue-600 text-white transition-all shadow-lg active:scale-95 ${page <= 1 ? 'pointer-events-none opacity-20' : ''}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="px-4 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Page Status</p>
                        <p className="text-sm font-bold text-white leading-none">
                            {page} <span className="text-slate-500 mx-1">/</span> {totalPages || 1}
                        </p>
                    </div>
                    <Link
                        href={`/users?page=${page + 1}`}
                        className={`p-2.5 rounded-xl bg-slate-700 hover:bg-blue-600 text-white transition-all shadow-lg active:scale-95 ${page >= totalPages ? 'pointer-events-none opacity-20' : ''}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {error ? (
                <div className="p-8 bg-red-900/20 text-red-400 border border-red-500/50 rounded-[2rem] flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-xs tracking-widest">Protocol Error</p>
                      <p className="text-sm font-medium">{error.message}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {profiles?.map((profile: any) => (
                        <div key={profile.id} className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-[2.5rem] p-8 hover:bg-slate-800/60 hover:border-blue-500/50 transition-all duration-500 shadow-xl flex flex-col space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform duration-500 overflow-hidden shadow-lg">
                                        {profile.avatar_url ? (
                                          <img src={profile.avatar_url} alt="User avatar" className="w-full h-full object-cover" />
                                        ) : (
                                          <UserIcon className="w-8 h-8 text-slate-500" />
                                        )}
                                    </div>
                                    {profile.is_superadmin && (
                                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-lg shadow-lg border-2 border-[#0f172a]">
                                        <ShieldCheck className="w-3 h-3" />
                                      </div>
                                    )}
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Entity ID</p>
                                  <p className="text-[10px] font-mono text-slate-400">{profile.id.substring(0, 12)}...</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-white truncate leading-tight">{profile.email || 'Anonymous User'}</h3>
                                {profile.is_superadmin ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-tighter border border-blue-500/20">
                                    <ShieldCheck className="w-3 h-3" />
                                    Executive Access
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-tighter border border-slate-700/30">
                                    Standard Profile
                                  </span>
                                )}
                            </div>

                            <div className="pt-6 border-t border-slate-700/30 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-900/50 rounded-lg flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                  </div>
                                  <div className="truncate">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Email Address</p>
                                    <p className="text-xs font-bold text-slate-400 truncate">{profile.email || 'No email registered'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-900/50 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Onboarded At</p>
                                    <p className="text-xs font-bold text-slate-400">
                                      {profile.created_datetime_utc ? new Date(profile.created_datetime_utc).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Archive data'}
                                    </p>
                                  </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
