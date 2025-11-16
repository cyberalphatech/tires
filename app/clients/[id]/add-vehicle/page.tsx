"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Car, Loader2, Upload } from "lucide-react"

interface Client {
  id: number
  first_name: string
  last_name: string
  client_code: string
  bodyshop_id: number
}

export default function AddVehiclePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const clientId = params.id

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    fuel_type: "",
    color: "",
    current_km: "",
    image_urls: null as File | null,
  })

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/details`)
      if (response.ok) {
        const data = await response.json()
        setClient(data.client)
      }
    } catch (error) {
      console.error("Error fetching client:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const submitData = new FormData()
      submitData.append("license_plate", formData.license_plate)
      submitData.append("make", formData.make)
      submitData.append("model", formData.model)
      submitData.append("year", formData.year.toString())
      submitData.append("fuel_type", formData.fuel_type)
      submitData.append("color", formData.color)
      submitData.append("current_km", formData.current_km)
      submitData.append("client_id", clientId)

      if (client?.bodyshop_id) {
        submitData.append("bodyshop_id", client.bodyshop_id.toString())
      }

      if (formData.image_urls) {
        submitData.append("image_urls", formData.image_urls)
      }

      const response = await fetch("/api/vehicles", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        setSuccess("Veicolo aggiunto con successo!")
        setTimeout(() => {
          router.push(`/clients/${clientId}`)
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Errore durante l'aggiunta del veicolo")
      }
    } catch (error) {
      setError("Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange("image_urls", file)
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/clients/${clientId}`)}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aggiungi Veicolo</h1>
            {client && (
              <p className="text-gray-600">
                Cliente: {client.first_name} {client.last_name} ({client.client_code})
              </p>
            )}
          </div>
        </div>

        {/* Add Vehicle Form */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Car className="w-5 h-5" />
              Informazioni Veicolo
            </CardTitle>
            <CardDescription>Inserisci i dettagli del nuovo veicolo per il cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* License Plate */}
              <div className="space-y-2">
                <Label htmlFor="license_plate" className="text-gray-700">
                  Targa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="license_plate"
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => handleInputChange("license_plate", e.target.value.toUpperCase())}
                  placeholder="AG123ED"
                  required
                  className="bg-gray-100 border-gray-300 text-gray-900"
                />
              </div>

              {/* Make and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-gray-700">
                    Marca <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="make"
                    type="text"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    placeholder="Fiat"
                    required
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-700">
                    Modello <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="500s"
                    required
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              {/* Year and Fuel Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-gray-700">
                    Anno <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", Number.parseInt(e.target.value))}
                    placeholder="2025"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type" className="text-gray-700">
                    Carburante
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("fuel_type", value)}>
                    <SelectTrigger className="bg-gray-100 border-gray-300 text-gray-900">
                      <SelectValue placeholder="Diesel" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="benzina">Benzina</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="gpl">GPL</SelectItem>
                      <SelectItem value="metano">Metano</SelectItem>
                      <SelectItem value="elettrica">Elettrica</SelectItem>
                      <SelectItem value="ibrida">Ibrida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current KM and Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_km" className="text-gray-700">
                    Chilometraggio (Km)
                  </Label>
                  <Input
                    id="current_km"
                    type="number"
                    value={formData.current_km}
                    onChange={(e) => handleInputChange("current_km", e.target.value)}
                    placeholder="150000"
                    min="0"
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-gray-700">
                    Colore
                  </Label>
                  <Input
                    id="color"
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder="Bianco, Nero, Rosso..."
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              {/* Car Picture Upload */}
              <div className="space-y-2">
                <Label htmlFor="image_urls" className="text-gray-700">
                  Foto Veicolo (opzionale)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image_urls"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-gray-100 border-gray-300 text-gray-900"
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                {formData.image_urls && (
                  <p className="text-sm text-gray-600">File selezionato: {formData.image_urls.name}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aggiungendo...
                  </>
                ) : (
                  "Aggiungi Veicolo"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
