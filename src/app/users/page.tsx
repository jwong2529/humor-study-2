import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

export default async function UsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_datetime_utc', { ascending: false })

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            <nav className="w-full bg-[#1e293b] border-b border-slate-700/50 flex justify-between items-center p-6">
                <div>
                    <h1 className="text-2xl font-black text-white px-2">Humor Study Admin</h1>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
                    <Link href="/users" className="text-white transition-colors text-sm font-medium">Users</Link>
                    <Link href="/images" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Images</Link>
                    <Link href="/captions" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Captions</Link>
                    <AuthButton user={user} />
                </div>
            </nav>
            <main className="p-8 max-w-7xl mx-auto space-y-8">
                <h2 className="text-xl font-bold">Users Directory</h2>
                {error ? (
                    <div className="p-4 bg-red-900/20 text-red-200 border border-red-500/50 rounded-xl">Error: {error.message}</div>
                ) : (
                    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
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
            </main>
        </div>
    )
}
