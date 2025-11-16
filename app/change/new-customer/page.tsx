"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, User, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface CustomerFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  tax_code: string
}

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [bodyshopId, setBodyshopId] = useState<string>("")

  const [formData, setFormData] = useState<CustomerFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    tax_code: "",
  })

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        const userId = user.id || user.customer_id || user.bodyshop_id
        if (userId) {
          setBodyshopId(userId.toString())
        } else {
          setError("Sessione scaduta. Effettua nuovamente il login.")
        }
      } else {
        setError("Sessione scaduta. Effettua nuovamente il login.")
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      setError("Errore nel recupero dei dati utente.")
    }
  }, [])

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const validateForm = (): boolean => {
    if (!formData.first_name.trim()) {
      setError("Il nome è obbligatorio")
      return false
    }
    if (!formData.last_name.trim()) {
      setError("Il cognome è obbligatorio")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Il numero di telefono è obbligatorio")
      return false
    }
    if (formData.email && !formData.email.includes("@")) {
      setError("Inserisci un indirizzo email valido")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/bodyshop/${bodyshopId}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bodyshop_id: bodyshopId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nella creazione del cliente")
      }

      const newClient = await response.json()
      setSuccess("Cliente creato con successo!")

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        tax_code: "",
      })

      setTimeout(() => {
        router.push("/change")
      }, 2000)
    } catch (error) {
      console.error("Error creating client:", error)
      setError(error instanceof Error ? error.message : "Errore nella creazione del cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen !bg-white" style={{ backgroundColor: "white" }}>
      {/* Header */}
      <div className="!bg-white border-b border-gray-200 shadow-sm" style={{ backgroundColor: "white" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/change">
              <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nuovo Cliente</h1>
                <p className="text-sm text-gray-600">Aggiungi un nuovo cliente al sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="!bg-white border-gray-200" style={{ backgroundColor: "white" }}>
            <CardHeader className="!bg-white" style={{ backgroundColor: "white" }}>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Informazioni Personali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 !bg-white" style={{ backgroundColor: "white" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Mario"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="h-12 bg-white text-gray-900 border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Cognome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Rossi"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="h-12 bg-white text-gray-900 border-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mario.rossi@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12 bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Telefono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+39 123 456 7890"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="h-12 bg-white text-gray-900 border-gray-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_code">Codice Fiscale</Label>
                <Input
                  id="tax_code"
                  placeholder="RSSMRA80A01H501Z"
                  value={formData.tax_code}
                  onChange={(e) => handleInputChange("tax_code", e.target.value.toUpperCase())}
                  className="h-12 bg-white text-gray-900 border-gray-300"
                  maxLength={16}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="!bg-white border-gray-200" style={{ backgroundColor: "white" }}>
            <CardHeader className="!bg-white" style={{ backgroundColor: "white" }}>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Indirizzo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 !bg-white" style={{ backgroundColor: "white" }}>
              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Input
                  id="address"
                  placeholder="Via Roma, 123"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="h-12 bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    placeholder="Milano"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="h-12 bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">CAP</Label>
                  <Input
                    id="postal_code"
                    placeholder="20100"
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    className="h-12 bg-white text-gray-900 border-gray-300"
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-gray-200 !bg-white" style={{ backgroundColor: "white" }}>
              <CardContent className="p-4 !bg-white" style={{ backgroundColor: "white" }}>
                <p className="text-gray-900 text-sm">{success}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Link href="/change">
              <Button variant="outline" type="button" className="bg-transparent border-gray-300">
                Annulla
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-gray-800 hover:bg-gray-700 text-white min-w-[120px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salva Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
