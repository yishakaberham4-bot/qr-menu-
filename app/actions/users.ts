'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type UserProfile = {
  id: string
  staff_id: string
  full_name: string
  role: 'admin' | 'sales'
  is_active: boolean
}

export async function getUsers(): Promise<UserProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, staff_id, full_name, role, is_active')
    .order('staff_id')

  if (error) {
    console.error('getUsers error:', error)
    return []
  }

  return (data || []) as UserProfile[]
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, staff_id, full_name, role, is_active')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as UserProfile
}

export async function createUser(formData: FormData) {
  const supabase = await createClient()

  const staff_id = (formData.get('staff_id') as string)?.trim().toUpperCase()
  const full_name = (formData.get('full_name') as string)?.trim()
  const password = formData.get('password') as string
  const role = formData.get('role') as 'admin' | 'sales'

  if (!staff_id || !full_name || !password || !role) {
    return { error: 'All fields are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Check if staff_id already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('staff_id', staff_id)
    .maybeSingle()

  if (existing) {
    return { error: 'Staff ID already exists' }
  }

  const { error } = await supabase.from('users').insert({
    staff_id,
    full_name,
    password, // Note: in production you should hash this
    role,
    is_active: true,
  })

  if (error) {
    console.error('createUser error:', error)
    return { error: error.message || 'Failed to create user' }
  }

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function updateUser(id: string, formData: FormData) {
  const supabase = await createClient()

  const staff_id = (formData.get('staff_id') as string)?.trim().toUpperCase()
  const full_name = (formData.get('full_name') as string)?.trim()
  const password = formData.get('password') as string
  const role = formData.get('role') as 'admin' | 'sales'
  const is_active = formData.get('is_active') === 'true'

  if (!staff_id || !full_name || !role) {
    return { error: 'Staff ID, Full Name and Role are required' }
  }

  // Check if staff_id is taken by another user
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('staff_id', staff_id)
    .neq('id', id)
    .maybeSingle()

  if (existing) {
    return { error: 'Staff ID already exists' }
  }

  const updateData: Record<string, unknown> = {
    staff_id,
    full_name,
    role,
    is_active,
  }

  // Only update password if a new one was provided
  if (password && password.length >= 6) {
    updateData.password = password
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('updateUser error:', error)
    return { error: error.message || 'Failed to update user' }
  }

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function deleteUser(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('users').delete().eq('id', id)

  if (error) {
    console.error('deleteUser error:', error)
    return { error: error.message || 'Failed to delete user' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
