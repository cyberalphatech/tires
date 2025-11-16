"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Le password non corrispondono")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la registrazione")
      }

      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "Errore durante la registrazione")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="text-center space-y-4 bg-white">
          <div className="w-16 h-16 mx-auto bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Registrazione</CardTitle>
          <CardDescription className="text-gray-600">
            Crea il tuo account per iniziare a gestire il deposito pneumatici
          </CardDescription>
        </CardHeader>

        <CardContent className="bg-white">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-gray-700">
                Nome Officina
              </Label>
              <Input
                id="businessName"
                placeholder="Officina Rossi"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                required
                className="h-12 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="info@officina.it"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="h-12 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                Telefono
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+39 123 456 7890"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="h-12 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="h-12 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Conferma Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className="h-12 bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700">
                Indirizzo (opzionale)
              </Label>
              <Input
                id="address"
                placeholder="Via Roma 123, Milano"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="h-12 bg-white border-gray-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Registrazione in corso...
                </div>
              ) : (
                "Registrati"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Hai già un account?{" "}
              <Link href="/auth/login" className="text-gray-700 hover:underline font-medium">
                Accedi qui
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
