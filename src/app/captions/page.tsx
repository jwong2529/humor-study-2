import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function CaptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const pageSize = 10
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
        <div className="p-8 w-full mx-auto space-y-8 flex flex-col h-screen">
            <div className="flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold">List of Captions ({totalCount} Total)</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/captions?page=${Math.max(1, page - 1)}`}
                            className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${page <= 1 ? 'pointer-events-none opacity-30' : ''}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                        <span className="text-sm font-medium text-slate-400">
                            Page <span className="text-white">{page}</span> of {totalPages || 1}
                        </span>
                        <Link
                            href={`/captions?page=${page + 1}`}
                            className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${page >= totalPages ? 'pointer-events-none opacity-30' : ''}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-red-900/20 text-red-200 border border-red-500/50 rounded-xl">Error: {error.message}</div>
            ) : (
                <div className="bg-[#1e293b] border border-slate-700 rounded-2xl flex flex-col gap-0 divide-y divide-slate-700 flex-1 overflow-y-auto min-h-0">
                    {captions?.map((caption: any) => (
                        <div key={caption.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-800 transition-colors items-center">
                            <div className="w-full md:w-48 h-32 bg-slate-900 border border-slate-700 rounded-xl flex-shrink-0 relative">
                                {caption.images?.url ? (
                                    <img src={caption.images.url} alt="Context" className="w-full h-full object-contain pointer-events-none" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 select-none">No Image</div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold bg-slate-700 px-2 py-1 uppercase font-mono tracking-widest rounded-md text-slate-300">
                                        ID: {caption.id.substring(0, 8)}
                                    </p>
                                    <p className="text-xs text-slate-500">{new Date(caption.created_datetime_utc).toLocaleString()}</p>
                                </div>
                                <p className="text-lg font-medium text-white">{caption.content || <i>No content</i>}</p>
                                <p className="text-xs font-mono text-blue-400">Author: {caption.profiles?.email || caption.profile_id}</p>
                            </div>
                        </div>
                    ))}
                    {!captions?.length && <div className="p-8 text-center text-slate-500">No captions found</div>}
                </div>
            )}
        </div>
    )
}
