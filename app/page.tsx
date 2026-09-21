import { createClient } from '@/lib/supabase/server'
import MenuClient from './MenuClient'

export default async function MenuPage() {
  const supabase = await createClient()

  // Get restaurant settings
  const { data: settings } = await supabase
    .from('restaurant_settings')
    .select('*')
    .limit(1)
    .single()

  // Get categories and items
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order')

  const restaurantName = settings?.name || 'OUR MENU'
  const logoUrl = settings?.logo_url
  const phone = settings?.phone
  const openingHours = settings?.opening_hours

  return (
    <div className="min-h-screen bg-[#f8f1e9] relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c4a8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Header with Restaurant Info */}
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="inline-block bg-white p-4 rounded-2xl shadow-sm mb-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={restaurantName}
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-[#8B5E3C] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {restaurantName.charAt(0)}
              </div>
            )}
          </div>
          
          <p className="text-sm tracking-[0.3em] text-[#8B5E3C] mb-2">WELCOME TO</p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3d2b1f] mb-3">
            {restaurantName}
          </h1>
          <div className="w-16 h-0.5 bg-[#c9a86c] mx-auto mb-4"></div>
          
          {/* Phone & Opening Hours */}
          <div className="space-y-1 text-sm text-[#6b5b4f]">
            {phone && (
              <p>
                <span className="font-medium">Phone:</span> {phone}
              </p>
            )}
            {openingHours && (
              <p className="whitespace-pre-line">
                <span className="font-medium">Hours:</span> {openingHours}
              </p>
            )}
          </div>

          <p className="text-xs text-[#8B5E3C] mt-4 tracking-widest">ALL PRICES IN ETB</p>
        </div>

        {/* Interactive Menu */}
        <MenuClient categories={categories || []} items={items || []} />
      </div>

      {/* Floating Pay Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button className="bg-[#7a1f1f] hover:bg-[#5c1717] text-white px-10 py-4 rounded-full font-medium shadow-xl transition">
          Pay your bill
        </button>
      </div>
    </div>
  )
}