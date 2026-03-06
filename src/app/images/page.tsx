'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import { useState, useEffect } from 'react'

export default function ImagesPage() {
    const [user, setUser] = useState<any>(null)
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)

    const [newUrl, setNewUrl] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editUrl, setEditUrl] = useState('')

    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        fetchImages()
    }, [])

    const fetchImages = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('images').select('*').order('created_datetime_utc', { ascending: false })
        if (error) setError(error.message)
        else setImages(data || [])
        setLoading(false)
    }

    const handleCreate = async () => {
        if (!newUrl) return
        const { error } = await supabase.from('images').insert([{
            url: newUrl,
            is_public: true,
            profile_id: user.id
        }])
        if (error) alert(error.message)
        else {
            setNewUrl('')
            fetchImages()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return
        const { error } = await supabase.from('images').delete().eq('id', id)
        if (error) alert(error.message)
        else fetchImages()
    }

    const handleUpdate = async () => {
        if (!editingId || !editUrl) return
        const { error } = await supabase.from('images').update({ url: editUrl }).eq('id', editingId)
        if (error) alert(error.message)
        else {
            setEditingId(null)
            setEditUrl('')
            fetchImages()
        }
    }

    const editMode = (id: string, currentUrl: string) => {
        setEditingId(id)
        setEditUrl(currentUrl)
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            <nav className="w-full bg-[#1e293b] border-b border-slate-700/50 flex justify-between items-center p-6">
                <div>
                    <h1 className="text-2xl font-black text-white px-2">Humor Study Admin</h1>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
                    <Link href="/users" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Users</Link>
                    <Link href="/images" className="text-white transition-colors text-sm font-medium">Images</Link>
                    <Link href="/captions" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Captions</Link>
                    <AuthButton user={user} />
                </div>
            </nav>
            <main className="p-8 max-w-7xl mx-auto space-y-8">
                <h2 className="text-xl font-bold">Manage Images</h2>

                {/* Create new image form */}
                <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="New Image URL..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg"
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Add Image
                    </button>
                </div>

                {error && <div className="text-red-500 font-bold p-4 bg-red-900/20 rounded-xl">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        images.map(img => (
                            <div key={img.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-colors">
                                <div className="w-full h-48 bg-black relative">
                                    <img src={img.url} alt="Humor" className="w-full h-full object-contain pointer-events-none" />
                                </div>
                                <div className="p-4 space-y-4">
                                    {editingId === img.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editUrl}
                                                onChange={(e) => setEditUrl(e.target.value)}
                                                className="flex-1 text-sm bg-slate-900 text-white border border-slate-600 px-2 py-1 rounded"
                                            />
                                            <button onClick={handleUpdate} className="bg-green-600 text-xs px-2 py-1 rounded font-bold text-white">Save</button>
                                            <button onClick={() => setEditingId(null)} className="bg-slate-600 text-xs px-2 py-1 rounded font-bold text-white">Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 truncate break-all" title={img.url}>{img.url}</div>
                                    )}

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="bg-slate-700 text-slate-300 font-mono px-2 py-1 rounded uppercase">
                                            ID: {img.id.substring(0, 8)}
                                        </span>
                                        <div className="flex gap-2">
                                            {editingId !== img.id && (
                                                <>
                                                    <button onClick={() => editMode(img.id, img.url)} className="text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase">Edit</button>
                                                    <button onClick={() => handleDelete(img.id)} className="text-red-400 font-bold hover:text-red-300 transition-colors uppercase">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
