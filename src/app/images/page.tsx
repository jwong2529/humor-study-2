'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import CRUDComponent from '@/components/CRUDComponent'
import { Upload, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ImagesPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)

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
        setStatus('Generating upload URL...')

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

            if (!presignedRes.ok) throw new Error("Failed to get upload URL")
            const { presignedUrl, cdnUrl } = await presignedRes.json()

            // Step 2: Upload to S3
            setStatus('Uploading to S3...')
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            })

            if (!uploadRes.ok) throw new Error("Failed to upload to S3")

            // Step 3: Register in Pipeline
            setStatus('Registering in pipeline...')
            const registerRes = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false })
            })

            if (!registerRes.ok) throw new Error("Failed to register image")
            
            setStatus('Success! Image registered.')
            setFile(null)
            // Trigger a refresh of the CRUD table if we had a way, but since it's separate components, 
            // the user might need to refresh or we could use a key.
            window.location.reload() 

        } catch (err: any) {
            setError(err.message)
            setStatus('')
        } finally {
            setUploading(false)
        }
    }

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-12">
            <section className="bg-[#1e293b] border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Upload className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Upload className="w-6 h-6 text-blue-400" />
                            Upload to Pipeline
                        </h2>
                        <p className="text-slate-400 text-sm">Register new images directly into the AI processing pipeline</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="flex-1 w-full">
                            <div className="border-2 border-dashed border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all rounded-2xl p-4 flex items-center justify-center cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                                    <span className="text-slate-400 text-sm font-medium group-hover:text-slate-200">
                                        {file ? file.name : 'Select image file...'}
                                    </span>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </div>
                        </label>
                        
                        <button
                            onClick={handleUploadToPipeline}
                            disabled={!file || uploading}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 shrink-0"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            Run Pipeline
                        </button>
                    </div>

                    {status && (
                        <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            {status}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
            </section>

            <CRUDComponent tableKey="images" />
        </main>
    )
}
