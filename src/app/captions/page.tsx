import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, FileText, Calendar, Hash, User as UserIcon } from 'lucide-react'

export default async function CaptionsPage({
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

    const { data: captions, error, count } = await supabase
        .from('captions')
        .select(`
      *,
      images (
        url
      ),
      profiles!profile_id (
        email
      )
    `, { count: 'exact' })
        .order('created_datetime_utc', { ascending: false })
        .range(start, end)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <main className="p-8 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Captions Library</h1>
                    </div>
                    <p className="text-slate-400 font-medium ml-[3.75rem]">Discovering the linguistics of humor ({totalCount} total entries)</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-800/40 backdrop-blur-md p-2 rounded-2xl border border-slate-700/50 shadow-xl self-end">
                    <Link
                        href={`/captions?page=${Math.max(1, page - 1)}`}
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
                        href={`/captions?page=${page + 1}`}
                        className={`p-2.5 rounded-xl bg-slate-700 hover:bg-blue-600 text-white transition-all shadow-lg active:scale-95 ${page >= totalPages ? 'pointer-events-none opacity-20' : ''}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {error ? (
                <div className="p-8 bg-red-900/20 text-red-400 border border-red-500/50 rounded-[2rem] flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-xs tracking-widest">Database Error</p>
                      <p className="text-sm font-medium">{error.message}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {captions?.map((caption: any) => (
                        <div key={caption.id} className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-[2.5rem] overflow-hidden flex flex-col hover:bg-slate-800/60 hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/10">
                            <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                                {caption.images?.url ? (
                                    <img 
                                        src={caption.images.url} 
                                        alt="Contextual image" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-700">
                                        <Hash className="w-8 h-8 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No Visual context</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Hash className="w-3 h-3 text-blue-400" />
                                        ID: {caption.id.substring(0, 6)}
                                    </p>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex-1 space-y-4">
                                    <p className="text-xl font-black text-white leading-tight tracking-tight min-h-[3rem]">
                                        {caption.content || <span className="opacity-20 italic">No text content</span>}
                                    </p>
                                    
                                    <div className="pt-6 border-t border-slate-700/30 space-y-3">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                              <UserIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Contributor</p>
                                              <p className="text-xs font-bold text-blue-400 truncate max-w-[180px]">{caption.profiles?.email || 'Anonymous System'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                              <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Published</p>
                                              <p className="text-xs font-bold text-slate-300">
                                                {new Date(caption.created_datetime_utc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                              </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!captions?.length && (
                        <div className="col-span-full py-32 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-700">
                              <FileText className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-500 font-medium italic">No captions have been curated yet.</p>
                        </div>
                    )}
                </div>
            )}
        </main>
    )
}
