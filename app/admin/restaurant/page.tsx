'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RestaurantProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    async function loadSettings() {
      const { data } = await supabase
        .from('restaurant_settings')
        .select('*')
        .limit(1)
        .single()

      if (data) {
        setSettingsId(data.id)
        setName(data.name || '')
        setPhone(data.phone || '')
        setOpeningHours(data.opening_hours || '')
        setLogoPreview(data.logo_url)
      }
      setLoading(false)
    }

    loadSettings()
  }, [])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  async function uploadLogo(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file)

    if (error) {
      alert('Logo upload failed: ' + error.message)
      return null
    }

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    let logoUrl = logoPreview

    if (logoFile) {
      const uploaded = await uploadLogo(logoFile)
      if (!uploaded) {
        setSaving(false)
        return
      }
      logoUrl = uploaded
    }

    const data = {
      name,
      phone,
      opening_hours: openingHours,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    }

    let error
    if (settingsId) {
      const { error: updateError } = await supabase
        .from('restaurant_settings')
        .update(data)
        .eq('id', settingsId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('restaurant_settings')
        .insert(data)
      error = insertError
    }

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Restaurant profile saved successfully!')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Restaurant Profile</h1>
            <p className="text-gray-500 text-sm">Update your restaurant information</p>
          </div>
          <a href="/admin" className="text-sm text-blue-600 hover:underline">
            ← Back to Admin
          </a>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Restaurant Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Melala Cafe"
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-600 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +251 9XX XXX XXX"
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-600 outline-none"
              />
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-sm font-medium mb-2">Opening Hours</label>
              <textarea
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                rows={3}
                placeholder="Mon - Fri: 8:00 AM - 10:00 PM&#10;Sat - Sun: 9:00 AM - 11:00 PM"
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Restaurant Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              {logoPreview && (
                <div className="mt-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-28 h-28 object-contain rounded-xl border bg-gray-50"
                  />
                </div>
              )}
            </div>

            {message && (
              <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-700 text-white py-3 rounded-xl font-medium hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Restaurant Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}