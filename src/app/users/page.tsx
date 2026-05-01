import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function UsersPage({
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

    const { data: profiles, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_datetime_utc', { ascending: false })
        .range(start, end)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Users Directory ({totalCount} Total)</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/users?page=${Math.max(1, page - 1)}`}
                                className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all ${page <= 1 ? 'pointer-events-none opacity-30' : ''}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>
                            <span className="text-sm font-medium text-slate-400">
                                Page <span className="text-white">{page}</span> of {totalPages || 1}
                            </span>
                            <Link
                                href={`/users?page=${page + 1}`}
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
                    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#334155] border-b border-slate-700">
                                    <th className="p-4 text-sm font-medium text-slate-400">ID</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Name / Avatar</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Superadmin</th>
                                    <th className="p-4 text-sm font-medium text-slate-400">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles?.map((profile: any) => (
                                    <tr key={profile.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-xs font-mono text-slate-500">{profile.id}</td>
                                        <td className="p-4 text-sm">
                                            <div className="flex items-center gap-3">
                                                {profile.avatar_url && <img src={profile.avatar_url} className="w-8 h-8 rounded-full" alt="avatar" />}
                                                {profile.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {profile.is_superadmin ? (
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs font-bold uppercase">Yes</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs uppercase font-bold">No</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500">
                                            {profile.created_datetime_utc ? new Date(profile.created_datetime_utc).toLocaleString() : 'Unknown'}
                                        </td>
                                    </tr>
                                ))}
                                {!profiles?.length && <tr><td colSpan={4} className="p-4 text-center text-slate-500">No users found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
        </div>
    )
}
