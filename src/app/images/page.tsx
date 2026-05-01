'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import CRUDComponent from '@/components/CRUDComponent'
import { Upload, Loader2, Sparkles, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react'

export default function ImagesPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
            setError(null)
            setStatus('')
        }
    }

    const handleUploadToPipeline = async () => {
        if (!file || !user) return
        setUploading(true)
        setError(null)
        setStatus('Initializing secure link...')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("Auth session missing")
            const token = session.access_token

            // Step 1: Generate presigned URL
            const presignedRes = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType: file.type })
            })

            if (!presignedRes.ok) throw new Error("Connection failed")
            const { presignedUrl, cdnUrl } = await presignedRes.json()

            // Step 2: Upload to S3
            setStatus('Streaming data to node...')
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            })

            if (!uploadRes.ok) throw new Error("Transfer failure")

            // Step 3: Register in Pipeline
            setStatus('Synchronizing with registry...')
            const registerRes = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false })
            })

            if (!registerRes.ok) throw new Error("Registration timeout")
            
            setStatus('Deployment complete. Entity registered.')
            setFile(null)
            setRefreshKey(prev => prev + 1)
        } catch (err: any) {
            setError(err.message)
            setStatus('')
        } finally {
            setUploading(false)
        }
    }

    return (
        <main className="p-8 space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Image Repository</h1>
                    </div>
                    <p className="text-slate-400 font-medium ml-[3.75rem]">Visual asset management and AI pipeline ingestion</p>
                </div>
            </header>

            <section className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                    <Upload className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Upload className="w-6 h-6 text-blue-400" />
                                Pipeline Ingestion
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">Inject high-resolution entities into the processing cluster</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <label className="flex-1 w-full group/label">
                            <div className="border-2 border-dashed border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/50 hover:border-blue-500/50 transition-all duration-300 rounded-3xl p-6 flex items-center justify-center cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover/label:scale-110 transition-transform">
                                      <Sparkles className="w-5 h-5 text-slate-500 group-hover/label:text-blue-400" />
                                    </div>
                                    <span className="text-slate-500 text-base font-bold group-hover/label:text-slate-300 transition-colors">
                                        {file ? file.name : 'Select entity to upload...'}
                                    </span>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </label>
                        
                        <button
                            onClick={handleUploadToPipeline}
                            disabled={!file || uploading}
                            className="w-full lg:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-6 rounded-3xl font-black transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 group/btn"
                        >
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 group-hover/btn:-translate-y-1 transition-transform" />}
                            Execute Pipeline
                        </button>
                    </div>

                    {(status || error) && (
                      <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {status && (
                            <div className="flex items-center gap-3 text-emerald-400 text-sm font-black uppercase tracking-widest bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                {status}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-3 text-red-400 text-sm font-black uppercase tracking-widest bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                      </div>
                    )}
                </div>
            </section>

            <div className="pt-8">
              <CRUDComponent key={refreshKey} tableKey="images" />
            </div>
        </main>
    )
}
