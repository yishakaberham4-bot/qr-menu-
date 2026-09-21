'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminClient from './AdminClient'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [username, setUsername] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    setUsername(localStorage.getItem('admin_username') || 'A')

    async function loadData() {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order')

      setCategories(cats || [])
      setItems(menuItems || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <a href="/" className="text-sm text-gray-600 hover:text-black">
            ← Public Menu
          </a>

          <div className="flex items-center gap-5">
            {/* Restaurant Profile */}
            <a
              href="/admin/restaurant"
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              Restaurant Profile
            </a>

            {/* QR Code */}
            <a
              href="/admin/qr"
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              QR Code
            </a>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem('admin_logged_in')
                localStorage.removeItem('admin_username')
                router.push('/admin/login')
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>

            {/* Circular Profile Button */}
            <a
              href="/admin/profile"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-md hover:scale-105 transition"
              title="Account Settings"
            >
              {username.charAt(0).toUpperCase()}
            </a>
          </div>
        </div>

        <AdminClient categories={categories} items={items} />
      </div>
    </div>
  )
}