"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function CambioPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  ← Indietro
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestione Cambio</h1>
                <p className="text-sm text-gray-600">Seleziona un'opzione per iniziare</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🔄 CAMBIO PNEUMATICI</h2>
          <p className="text-gray-600 text-lg">Scegli come procedere con il cambio stagionale</p>
        </div>

        {/* Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* New Customer */}
          <Link href="/change/new-customer">
            <Card className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      <circle cx="19" cy="8" r="3" fill="white" />
                      <path d="M19 6v4M17 8h4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">NUOVO CLIENTE</h3>
                    <p className="text-gray-700">Registra un nuovo cliente e gestisci i suoi pneumatici</p>
                  </div>

                  <Button className="w-full h-12 text-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white">
                    Registra Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Scan Plate */}
          <Link href="/plate-reader">
            <Card className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect
                        x="2"
                        y="6"
                        width="20"
                        height="12"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <rect
                        x="4"
                        y="8"
                        width="16"
                        height="8"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                      />
                      <path d="M8 10h8M8 12h6M8 14h4" />
                      <circle cx="12" cy="2" r="1" fill="currentColor" />
                      <path d="M12 3v1" />
                    </svg>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">SCANSIONA TARGA</h3>
                    <p className="text-gray-700">Leggi automaticamente la targa per trovare il cliente</p>
                  </div>

                  <Button className="w-full h-12 text-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white">
                    Avvia Scanner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Azioni Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link href="/inventory">
              <Card className="bg-white hover:bg-gray-50 border-gray-200 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-green-600 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm">Inventario</h4>
                </CardContent>
              </Card>
            </Link>

            <Link href="/winter">
              <Card className="bg-white hover:bg-gray-50 border-gray-200 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-blue-600 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm">Invernali</h4>
                </CardContent>
              </Card>
            </Link>

            <Link href="/summer">
              <Card className="bg-white hover:bg-gray-50 border-gray-200 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-orange-600 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm">Estivi</h4>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
