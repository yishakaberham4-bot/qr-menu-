'use client'

import { useState, useEffect } from 'react'

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

export default function MenuClient({
  categories,
  items,
}: {
  categories: Category[]
  items: MenuItem[]
}) {
  const [lang, setLang] = useState<'en' | 'am'>('en')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('menu_lang') as 'en' | 'am'
    if (saved) setLang(saved)
  }, [])

  function changeLang(newLang: 'en' | 'am') {
    setLang(newLang)
    localStorage.setItem('menu_lang', newLang)
  }

  const getName = (item: MenuItem) => (lang === 'am' && item.name_am ? item.name_am : item.name)
  const getDesc = (item: MenuItem) => (lang === 'am' && item.description_am ? item.description_am : item.description)
  const getCatName = (cat: Category) => (lang === 'am' && cat.name_am ? cat.name_am : cat.name)

  // Hide unavailable items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true
    const name = getName(item).toLowerCase()
    const desc = (getDesc(item) || '').toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase())

    return item.available && matchesCategory && matchesSearch
  })

  const grouped = categories
    .map((cat) => ({
      ...cat,
      items: filteredItems.filter((item) => item.category_id === cat.id),
    }))
    .filter((cat) => cat.items.length > 0)

  return (
    <>
      {/* Language Switcher */}
      <div className="flex justify-end mb-6">
        <div className="bg-white rounded-full border border-[#e8d9c5] p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => changeLang('en')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              lang === 'en' ? 'bg-[#3d2b1f] text-white' : 'text-[#3d2b1f]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => changeLang('am')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              lang === 'am' ? 'bg-[#3d2b1f] text-white' : 'text-[#3d2b1f]'
            }`}
          >
            አማርኛ
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder={lang === 'am' ? 'ምናሌውን ይፈልጉ...' : 'Search the menu...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-6 py-3 rounded-full border border-[#e8d9c5] bg-white/80 text-[#3d2b1f] placeholder:text-[#a8947e] focus:outline-none focus:ring-2 focus:ring-[#c9a86c]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-10">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
            selectedCategory === null
              ? 'bg-[#3d2b1f] text-white'
              : 'bg-white border border-[#e8d9c5] text-[#3d2b1f]'
          }`}
        >
          {lang === 'am' ? 'ሁሉም' : 'ALL'}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-[#3d2b1f] text-white'
                : 'bg-white border border-[#e8d9c5] text-[#3d2b1f]'
            }`}
          >
            {getCatName(cat)}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {grouped.map((category) => (
          <div key={category.id} className="bg-white/90 rounded-3xl p-6 shadow-sm border border-[#f0e6d8]">
            <div className="mb-6">
              <span className="bg-[#c9a86c] text-white text-xs font-medium px-3 py-1 rounded-full">
                {getCatName(category).toUpperCase()}
              </span>
            </div>

            <div className="space-y-5">
              {category.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#f0e6d8]">
                    {item.image_url ? (
                      <img src={item.image_url} alt={getName(item)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#c9a86c] text-xs">No img</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#3d2b1f] text-lg">{getName(item)}</h3>
                    {getDesc(item) && (
                      <p className="text-sm text-[#8a7a6a] mt-0.5 line-clamp-1">{getDesc(item)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#3d2b1f] text-lg">{Number(item.price).toFixed(0)}</span>
                    <button className="w-9 h-9 rounded-full border-2 border-[#c9a86c] text-[#c9a86c] flex items-center justify-center hover:bg-[#c9a86c] hover:text-white transition">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-20 text-[#8a7a6a]">
          {lang === 'am' ? 'ምንም አልተገኘም' : 'No items found.'}
        </div>
      )}
    </>
  )
}