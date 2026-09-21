'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
  name_am: string | null
  sort_order: number
}

type MenuItem = {
  id: string
  category_id: string
  name: string
  name_am: string | null
  description: string | null
  description_am: string | null
  price: number
  available: boolean
  image_url: string | null
}

export default function AdminClient({
  categories,
  items,
}: {
  categories: Category[]
  items: MenuItem[]
}) {
  const router = useRouter()
  const supabase = createClient()

  // Category states
  const [catName, setCatName] = useState('')
  const [catNameAm, setCatNameAm] = useState('')
  const [catSort, setCatSort] = useState('0')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catLoading, setCatLoading] = useState(false)

  // Item states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [nameAm, setNameAm] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionAm, setDescriptionAm] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(false)

  // ========== CATEGORY FUNCTIONS ==========
  function startEditCategory(cat: Category) {
    setEditingCatId(cat.id)
    setCatName(cat.name)
    setCatNameAm(cat.name_am || '')
    setCatSort(String(cat.sort_order))
  }

  function cancelEditCategory() {
    setEditingCatId(null)
    setCatName('')
    setCatNameAm('')
    setCatSort('0')
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault()
    setCatLoading(true)

    const data = {
      name: catName,
      name_am: catNameAm || null,
      sort_order: parseInt(catSort) || 0,
    }

    let error
    if (editingCatId) {
      const { error: updateError } = await supabase
        .from('categories')
        .update(data)
        .eq('id', editingCatId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('categories').insert(data)
      error = insertError
    }

    if (error) {
      alert('Error: ' + error.message)
    } else {
      cancelEditCategory()
      router.refresh()
    }
    setCatLoading(false)
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    router.refresh()
  }

  // ========== ITEM FUNCTIONS ==========
  function startEdit(item: MenuItem) {
    setEditingId(item.id)
    setName(item.name)
    setNameAm(item.name_am || '')
    setDescription(item.description || '')
    setDescriptionAm(item.description_am || '')
    setPrice(String(item.price))
    setCategoryId(item.category_id)
    setImagePreview(item.image_url)
    setImageFile(null)
    setAvailable(item.available)
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setNameAm('')
    setDescription('')
    setDescriptionAm('')
    setPrice('')
    setCategoryId(categories[0]?.id || '')
    setImageFile(null)
    setImagePreview(null)
    setAvailable(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from('menu-images').upload(fileName, file)
    if (error) {
      alert('Image upload failed: ' + error.message)
      return null
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let imageUrl = imagePreview
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile)
      if (!uploadedUrl) {
        setLoading(false)
        return
      }
      imageUrl = uploadedUrl
    }

    const data = {
      name,
      name_am: nameAm || null,
      description: description || null,
      description_am: descriptionAm || null,
      price: parseFloat(price),
      category_id: categoryId,
      image_url: imageUrl || null,
      available,
    }

    let error
    if (editingId) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update(data)
        .eq('id', editingId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('menu_items').insert(data)
      error = insertError
    }

    if (error) {
      alert('Error: ' + error.message)
    } else {
      cancelEdit()
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleAvailable(id: string, current: boolean) {
    await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    router.refresh()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-10">
      {/* CATEGORIES */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white px-8 py-5">
          <h2 className="text-xl font-semibold">Manage Categories</h2>
        </div>
        <div className="p-8">
          <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Category name (English)"
              required
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-600 outline-none"
            />
            <input
              type="text"
              value={catNameAm}
              onChange={(e) => setCatNameAm(e.target.value)}
              placeholder="የምድብ ስም (አማርኛ)"
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-600 outline-none"
            />
            <input
              type="number"
              value={catSort}
              onChange={(e) => setCatSort(e.target.value)}
              placeholder="Order"
              className="px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-600 outline-none"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={catLoading} className="bg-amber-700 text-white px-6 py-3 rounded-xl hover:bg-amber-800">
                {editingCatId ? 'Update' : 'Add Category'}
              </button>
              {editingCatId && (
                <button type="button" onClick={cancelEditCategory} className="bg-gray-200 px-6 py-3 rounded-xl">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
                <div>
                  <div className="font-medium">{cat.name}</div>
                  {cat.name_am && <div className="text-sm text-gray-500">{cat.name_am}</div>}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEditCategory(cat)} className="text-blue-600 text-sm">Edit</button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-600 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MENU ITEMS FORM */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-5">
          <h2 className="text-xl font-semibold">{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name (English) *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ስም (አማርኛ)</label>
            <input type="text" value={nameAm} onChange={(e) => setNameAm(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (English)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">መግለጫ (አማርኛ)</label>
            <textarea value={descriptionAm} onChange={(e) => setDescriptionAm(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none bg-white">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Food Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-black outline-none" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-xl border" />}
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} id="available" className="w-5 h-5" />
            <label htmlFor="available">Available</label>
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50">
              {loading ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-gray-200 px-8 py-3 rounded-xl">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* ITEMS LIST WITH TOGGLE SWITCH */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gray-50 px-8 py-5 border-b flex justify-between">
          <h2 className="text-xl font-semibold">Current Menu Items</h2>
          <span className="text-sm text-gray-500">{items.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-8 py-4">Item</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Available</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => {
                const category = categories.find((c) => c.id === item.category_id)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200" />
                        )}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.name_am && <div className="text-sm text-gray-500">{item.name_am}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">${Number(item.price).toFixed(2)}</td>
                    <td className="px-6 py-4">{category?.name || '-'}</td>

                    {/* Toggle Switch */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailable(item.id, item.available)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.available ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-600">
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => startEdit(item)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      <button onClick={() => deleteItem(item.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}