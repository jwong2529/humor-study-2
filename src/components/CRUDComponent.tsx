'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Pencil, Trash2, Save, X, Loader2, ChevronRight } from 'lucide-react'
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
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(tableKey as string)
      .select('*')
      .order('created_datetime_utc', { ascending: false })
      .limit(100)

    if (error) {
       // fallback if created_datetime_utc doesn't exist
       const { data: fallbackData, error: fallbackError } = await supabase
         .from(tableKey as string)
         .select('*')
         .limit(100)
       
       if (fallbackError) setError(fallbackError.message)
       else setData(fallbackData || [])
    } else {
      setData(data || [])
    }
    setLoading(false)
  }, [tableKey, supabase])

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

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-white">{schema.name}</h2>
          <p className="text-sm text-slate-400">Manage your {schema.name.toLowerCase()} records</p>
        </div>
        {!schema.readOnly && !isAdding && (
          <button 
            onClick={startAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
          Error: {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {isAdding ? <Plus className="w-4 h-4 text-blue-400" /> : <Pencil className="w-4 h-4 text-blue-400" />}
            {isAdding ? 'Add New Record' : 'Edit Record'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.columns.filter(c => !c.hideInForm).map(col => (
              <div key={col.key} className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{col.label}</label>
                {col.type === 'textarea' ? (
                  <textarea 
                    value={formData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none min-h-[100px]"
                  />
                ) : col.type === 'boolean' ? (
                  <div className="flex items-center h-10">
                    <input 
                      type="checkbox"
                      checked={!!formData[col.key]}
                      onChange={(e) => handleInputChange(col.key, e.target.checked)}
                      className="w-4 h-4 bg-slate-900 border-slate-700 rounded"
                    />
                  </div>
                ) : (
                  <input 
                    type={col.type === 'number' ? 'number' : 'text'}
                    value={formData[col.key] || ''}
                    onChange={(e) => handleInputChange(col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button 
              onClick={cancel}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-xl font-bold transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                {schema.columns.map(col => (
                  <th key={col.key} className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{col.label}</th>
                ))}
                {!schema.readOnly && <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && !data.length ? (
                <tr>
                  <td colSpan={schema.columns.length + (schema.readOnly ? 0 : 1)} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                    <p className="text-slate-500 text-sm">Loading records...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns.length + (schema.readOnly ? 0 : 1)} className="p-8 text-center text-slate-500 text-sm italic">
                    No records found in this table.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    {schema.columns.map(col => (
                      <td key={col.key} className="p-4 text-sm">
                        {col.type === 'boolean' ? (
                          item[col.key] ? (
                            <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Yes</span>
                          ) : (
                            <span className="bg-slate-500/10 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">No</span>
                          )
                        ) : col.type === 'date' ? (
                          <span className="text-xs text-slate-500">{mounted && item[col.key] ? new Date(item[col.key]).toLocaleDateString() : (item[col.key] ? 'Loading...' : 'N/A')}</span>
                        ) : (
                          <div className={cn("max-w-[200px] truncate", col.mono && "font-mono text-xs text-blue-400")}>
                            {item[col.key]?.toString() || '-'}
                          </div>
                        )}
                      </td>
                    ))}
                    {!schema.readOnly && (
                      <td className="p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
