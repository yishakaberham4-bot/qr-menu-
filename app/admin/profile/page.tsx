'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [username, setUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [newUsername, setNewUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [userMsg, setUserMsg] = useState('')
  const [userLoading, setUserLoading] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }
    setUsername(localStorage.getItem('admin_username') || '')
  }, [])

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordLoading(true)

    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 4) {
      setPasswordMsg('Password must be at least 4 characters')
      setPasswordLoading(false)
      return
    }

    const { data: user } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', currentPassword)
      .single()

    if (!user) {
      setPasswordMsg('Current password is wrong')
      setPasswordLoading(false)
      return
    }

    const { error } = await supabase
      .from('admin_users')
      .update({ password: newPassword })
      .eq('username', username)

    if (error) {
      setPasswordMsg('Error: ' + error.message)
    } else {
      setPasswordMsg('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setUserMsg('')
    setUserLoading(true)

    if (newUserPassword.length < 4) {
      setUserMsg('Password must be at least 4 characters')
      setUserLoading(false)
      return
    }

    const { error } = await supabase.from('admin_users').insert({
      username: newUsername,
      password: newUserPassword,
    })

    if (error) {
      setUserMsg('Error: ' + error.message)
    } else {
      setUserMsg('New admin user added successfully!')
      setNewUsername('')
      setNewUserPassword('')
    }
    setUserLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-gray-500 text-sm">Logged in as: <strong>{username}</strong></p>
          </div>
          <a
            href="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Admin
          </a>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-purple-700 text-white px-6 py-3 rounded-xl hover:bg-purple-800 disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Add New User Card */}
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Add New Admin User</h2>
          </div>
          <form onSubmit={handleAddUser} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            {userMsg && (
              <p className={`text-sm ${userMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {userMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={userLoading}
              className="bg-indigo-700 text-white px-6 py-3 rounded-xl hover:bg-indigo-800 disabled:opacity-50"
            >
              {userLoading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}