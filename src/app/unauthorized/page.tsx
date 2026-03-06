import AuthButton from '@/components/AuthButton'
import { createClient } from '@/utils/supabase/server'

export default async function UnauthorizedPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 w-full flex flex-col items-center justify-center p-8">
            <div className="p-8 bg-slate-800/50 rounded-3xl border border-red-500/50 max-w-md text-center">
                <h1 className="text-3xl font-black text-white mb-4">Access Denied</h1>
                <p className="text-slate-400 mb-8">
                    You are logged in, but you do not have superadmin privileges.
                </p>
                <AuthButton user={user} />
            </div>
        </div>
    )
}
