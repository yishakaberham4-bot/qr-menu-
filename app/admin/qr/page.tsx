'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodePage() {
  const router = useRouter()
  const [menuUrl, setMenuUrl] = useState('')
  const [size, setSize] = useState(280)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }

    // Automatically use the current website URL
    if (typeof window !== 'undefined') {
      setMenuUrl(window.location.origin)
    }
  }, [])

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'menu-qr-code.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
            <p className="text-gray-500 mt-1">Generate and download the QR code for your menu</p>
          </div>
          <a
            href="/admin"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Admin
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border p-8">
          {/* URL Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu URL
            </label>
            <input
              type="text"
              value={menuUrl}
              onChange={(e) => setMenuUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none"
              placeholder="https://your-menu.netlify.app"
            />
            <p className="text-xs text-gray-400 mt-2">
              This is the link customers will open when they scan the QR code
            </p>
          </div>

          {/* Size Control */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Size: {size}px
            </label>
            <input
              type="range"
              min="180"
              max="400"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* QR Code Preview */}
          <div className="flex flex-col items-center">
            <div
              ref={canvasRef}
              className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-6"
            >
              {menuUrl ? (
                <QRCodeCanvas
                  value={menuUrl}
                  size={size}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="w-[280px] h-[280px] flex items-center justify-center text-gray-400">
                  Enter a URL
                </div>
              )}
            </div>

            <button
              onClick={downloadQR}
              disabled={!menuUrl}
              className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              Download QR Code (PNG)
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Print this QR code and place it on tables
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-semibold text-amber-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li>Print the QR code at least 5×5 cm for easy scanning</li>
            <li>Place it in good lighting</li>
            <li>You can change the URL if you later use a custom domain</li>
            <li>After downloading, you can print multiple copies</li>
          </ul>
        </div>
      </div>
    </div>
  )
}