'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Pencil, Trash2, Save, X, Loader2, ChevronRight, ChevronLeft, Database } from 'lucide-react'
import { tableSchemas } from '@/config/schemas'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CRUDProps {
  tableKey: keyof typeof tableSchemas
}

export default function CRUDComponent({ tableKey }: CRUDProps) {
  const schema = tableSchemas[tableKey]
  const supabase = createClient()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [isSuperadmin, setIsSuperadmin] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset to page 1 on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('is_superadmin')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setIsSuperadmin(!!data?.is_superadmin)
          })
      } else {
        setIsSuperadmin(false)
      }
    })
  }, [supabase])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
      .from(tableKey as string)
      .select('*', { count: 'exact' })

    // Apply search if debouncedSearch exists
    if (debouncedSearch) {
      const searchableCols = schema.columns.filter(c => c.type === 'text' || c.type === 'textarea')
      if (searchableCols.length > 0) {
        const searchFilter = searchableCols.map(c => `${c.key}.ilike.%${debouncedSearch}%`).join(',')
        query = query.or(searchFilter)
      }
    }

    const { data, error, count } = await query
      .order('created_datetime_utc', { ascending: false })
      .range(start, end)

    if (error) {
       // fallback if created_datetime_utc doesn't exist
       let fallbackQuery = supabase
         .from(tableKey as string)
         .select('*', { count: 'exact' })
       
       if (debouncedSearch) {
         const searchableCols = schema.columns.filter(c => c.type === 'text' || c.type === 'textarea')
         if (searchableCols.length > 0) {
           const searchFilter = searchableCols.map(c => `${c.key}.ilike.%${debouncedSearch}%`).join(',')
           fallbackQuery = fallbackQuery.or(searchFilter)
         }
       }

       const { data: fallbackData, error: fallbackError, count: fallbackCount } = await fallbackQuery
         .range(start, end)
       
       if (fallbackError) {
         setError(fallbackError.message)
       } else {
         setData(fallbackData || [])
         setTotalCount(fallbackCount || 0)
       }
    } else {
      setData(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }, [tableKey, supabase, currentPage, pageSize, debouncedSearch, schema.columns])

  useEffect(() => {
    setCurrentPage(1)
  }, [tableKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const startEdit = (item: any) => {
    setEditingId(item.id)
    setFormData(item)
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({})
  }

  const cancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({})
  }

  const handleSave = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in to perform this action.')
      setLoading(false)
      return
    }

    const payload = { ...formData }
    payload.modified_by_user_id = user.id
    if (!editingId) {
      payload.created_by_user_id = user.id
    }

    const { error } = editingId 
      ? await supabase.from(tableKey as string).update(payload).eq('id', editingId)
      : await supabase.from(tableKey as string).insert([payload])

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      cancel()
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    setLoading(true)
    const { error } = await supabase.from(tableKey as string).delete().eq('id', id)
    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      fetchData()
    }
  }

  if (isSuperadmin === false) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-2">Access Denied</h3>
        <p className="text-slate-400">You must be a superadmin to view or manage these records.</p>
      </div>
    )
  }

  if (isSuperadmin === null) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">{schema.name}</h2>
          <p className="text-sm text-slate-400 font-medium">Manage your {schema.name.toLowerCase()} records</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text"
              placeholder={`Search ${schema.name}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
            {loading && (
               <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-slate-500" />
            )}
          </div>
          {!schema.readOnly && !isAdding && (
            <button 
              onClick={startAdd}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
          Error: {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-10 space-y-8 animate-in fade-in slide-in-from-top-6 duration-500 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                {isAdding ? <Plus className="w-5 h-5 text-blue-400" /> : <Pencil className="w-5 h-5 text-blue-400" />}
              </div>
              {isAdding ? 'Create New Record' : 'Edit Existing Record'}
            </h3>
            <button onClick={cancel} className="p-2 hover:bg-slate-700 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {schema.columns.filter(c => !c.hideInForm).map(col => (
              <div key={col.key} className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{col.label}</label>
                {col.type === 'textarea' ? (
                  <textarea 
                    value={formData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, e.target.value)}
                    placeholder={`Enter ${col.label.toLowerCase()}...`}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none min-h-[140px] transition-all resize-none"
                  />
                ) : col.type === 'boolean' ? (
                  <div className="flex items-center gap-3 h-14 px-5 bg-slate-900/30 border border-slate-700/30 rounded-2xl">
                    <input 
                      type="checkbox"
                      checked={!!formData[col.key]}
                      onChange={(e) => handleInputChange(col.key, e.target.checked)}
                      className="w-5 h-5 bg-slate-900 border-slate-700 rounded-lg checked:bg-blue-600 transition-all cursor-pointer"
                    />
                    <span className="text-sm text-slate-400 font-medium">Enable {col.label}</span>
                  </div>
                ) : (
                  <input 
                    type={col.type === 'number' ? 'number' : 'text'}
                    value={formData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)}
                    placeholder={`Enter ${col.label.toLowerCase()}...`}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-slate-700/30">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Commit Changes
            </button>
            <button 
              onClick={cancel}
              className="flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-2xl font-black transition-all active:scale-95"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/50 sticky top-0 z-20">
                {schema.columns.map(col => (
                  <th key={col.key} className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{col.label}</th>
                ))}
                {!schema.readOnly && <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right w-32">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && !data.length ? (
                <tr>
                  <td colSpan={schema.columns.length + (schema.readOnly ? 0 : 1)} className="p-20 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4 opacity-50" />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Synchronizing Data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns.length + (schema.readOnly ? 0 : 1)} className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                      <Database className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium italic">Empty Dataset</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                    {schema.columns.map(col => (
                      <td key={col.key} className="p-6 text-sm">
                        {col.type === 'boolean' ? (
                          <div className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                            item[col.key] ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-700/30"
                          )}>
                            {item[col.key] ? 'Active' : 'Disabled'}
                          </div>
                        ) : col.type === 'date' ? (
                          <div className="flex flex-col">
                            <span className="text-slate-300 font-bold">{mounted && item[col.key] ? new Date(item[col.key]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">{mounted && item[col.key] ? new Date(item[col.key]).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                        ) : (
                          <div className={cn(
                            "truncate leading-relaxed transition-all",
                            col.mono ? "font-mono text-xs text-blue-400/80 bg-blue-500/5 px-2 py-1 rounded-lg border border-blue-500/10 inline-block max-w-full" : "text-slate-300 font-medium"
                          )}>
                            {item[col.key]?.toString() || <span className="opacity-20 text-xs italic">NULL</span>}
                          </div>
                        )}
                      </td>
                    ))}
                    {!schema.readOnly && (
                      <td className="p-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => startEdit(item)}
                            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white border border-slate-700 transition-all shadow-lg shadow-black/20"
                            title="Edit Record"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white border border-slate-700 transition-all shadow-lg shadow-black/20"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
          {totalCount > 0 ? (
            <p className="text-xs text-slate-400">
              Showing <span className="font-bold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-bold text-slate-200">{totalCount}</span> records
            </p>
          ) : (
            <p className="text-xs text-slate-400">No records to display</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 transition-all text-slate-300"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => (prev * pageSize < totalCount ? prev + 1 : prev))}
              disabled={currentPage * pageSize >= totalCount || loading}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 transition-all text-slate-300"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
