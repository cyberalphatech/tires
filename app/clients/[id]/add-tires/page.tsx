"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Loader2 } from "lucide-react"

interface Client {
  id: number
  first_name: string
  last_name: string
  client_code: string
}

interface Vehicle {
  id: number
  license_plate: string
  brand: string
  model: string
}

interface WarehousePosition {
  id: number
  position_code: string
  description: string
}

export default function AddTiresPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const clientId = params.id

  const [client, setClient] = useState<Client | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [warehousePositions, setWarehousePositions] = useState<WarehousePosition[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    vehicle_id: "",
    brand: "",
    model: "",
    size: "",
    season: "winter",
    dot_code: "",
    condition: "good",
    warehouse_position_id: "",
    notes: "",
    tread_depth: "",
    purchase_price: "",
    deposit_type: "active", // Updated default value to match new options
    storage_date: "",
    installation_date: "",
    removal_date: "",
    status: "active",
    position: "", // Added tire position field
  })

  useEffect(() => {
    fetchClientData()
    fetchVehicles()
    fetchWarehousePositions()
  }, [clientId])

  const fetchClientData = async () => {
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

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/vehicles`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(Array.isArray(data) ? data : [])
      } else {
        setVehicles([])
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      setVehicles([])
    }
  }

  const fetchWarehousePositions = async () => {
    try {
      // Get bodyshop ID from localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        const bodyshopId = user.id

        const response = await fetch(`/api/warehouse/positions/available?bodyshop_id=${bodyshopId}`)
        if (response.ok) {
          const data = await response.json()
          setWarehousePositions(Array.isArray(data.positions) ? data.positions : [])
        } else {
          setWarehousePositions([])
        }
      } else {
        setWarehousePositions([])
      }
    } catch (error) {
      console.error("Error fetching warehouse positions:", error)
      setWarehousePositions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const userData = localStorage.getItem("user")
      const bodyshopId = userData ? JSON.parse(userData).id : null
      const tireCode = `T${Date.now()}`

      console.log("[v0] Form submission started")
      console.log("[v0] Client ID from URL:", clientId)
      console.log("[v0] Bodyshop ID from localStorage:", bodyshopId)
      console.log("[v0] Generated tire code:", tireCode)
      console.log("[v0] Form data before processing:", formData)

      const mapStatusToDatabase = (status: string) => {
        switch (status) {
          case "active":
            return "sold"
          case "stored":
            return "stored"
          case "installed":
            return "in_use"
          case "disposed":
            return "scrapped"
          default:
            return status
        }
      }

      const requestPayload = {
        vehicle_id: formData.vehicle_id ? Number.parseInt(formData.vehicle_id) : null,
        client_id: Number.parseInt(clientId), // Use client_id instead of customer_id
        bodyshop_id: bodyshopId, // Add bodyshop_id as required field
        tire_code: tireCode, // Generate unique tire code
        brand: formData.brand,
        model: formData.model,
        size: formData.size,
        position: formData.position || null, // Added position field to request payload
        season: formData.season,
        dot_code: formData.dot_code || null,
        tread_depth: formData.tread_depth ? Number.parseFloat(formData.tread_depth) : null,
        condition: formData.condition,
        purchase_price: formData.purchase_price ? Number.parseFloat(formData.purchase_price) : null,
        warehouse_location: formData.warehouse_position_id || null,
        deposit_type: mapStatusToDatabase(formData.deposit_type), // Map deposit_type to database values
        storage_date: formData.storage_date || null,
        installation_date: formData.installation_date || null,
        removal_date: formData.removal_date || null,
        status: mapStatusToDatabase(formData.status), // Map status to database values
        notes: formData.notes || null,
      }

      console.log("[v0] Request payload to be sent:", requestPayload)
      console.log("[v0] Making POST request to /api/tires")

      const response = await fetch("/api/tires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (response.ok) {
        const responseData = await response.json()
        console.log("[v0] Success response data:", responseData)
        setSuccess("Pneumatico aggiunto con successo!")
        setTimeout(() => {
          router.push(`/clients/${clientId}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        console.log("[v0] Error response data:", errorData)
        setError(errorData.error || "Errore durante l'aggiunta del pneumatico")
      }
    } catch (error) {
      console.error("[v0] Catch block error:", error)
      setError("Errore di connessione")
    } finally {
      setSubmitting(false)
      console.log("[v0] Form submission completed")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/clients/${clientId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aggiungi Pneumatico</h1>
            {client && (
              <p className="text-gray-600">
                Cliente: {client.first_name} {client.last_name} ({client.client_code})
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="h-5 w-5" />
              Dettagli Pneumatico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="vehicle_id" className="text-gray-700">
                  Veicolo (Opzionale)
                </Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => handleInputChange("vehicle_id", value)}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Seleziona veicolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun veicolo specifico</SelectItem>
                    {Array.isArray(vehicles) &&
                      vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tire Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-gray-700">
                    Marca *
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="es. Michelin"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-700">
                    Modello *
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="es. Pilot Sport"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size" className="text-gray-700">
                    Misura *
                  </Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    placeholder="es. 205/55R16"
                    required
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-700">
                    Posizione Pneumatico
                  </Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Seleziona posizione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anteriore_destro">Anteriore Destro</SelectItem>
                      <SelectItem value="anteriore_sinistro">Anteriore Sinistro</SelectItem>
                      <SelectItem value="posteriore_destro">Posteriore Destro</SelectItem>
                      <SelectItem value="posteriore_sinistro">Posteriore Sinistro</SelectItem>
                      <SelectItem value="scorta">Scorta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season" className="text-gray-700">
                    Stagione
                  </Label>
                  <Select value={formData.season} onValueChange={(value) => handleInputChange("season", value)}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="winter">Invernale</SelectItem>
                      <SelectItem value="summer">Estivo</SelectItem>
                      <SelectItem value="all-season">4 Stagioni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dot_code" className="text-gray-700">
                    Codice DOT
                  </Label>
                  <Input
                    id="dot_code"
                    value={formData.dot_code}
                    onChange={(e) => handleInputChange("dot_code", e.target.value)}
                    placeholder="es. 2023"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-gray-700">
                    Condizione
                  </Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Eccellente</SelectItem>
                      <SelectItem value="good">Buona</SelectItem>
                      <SelectItem value="fair">Discreta</SelectItem>
                      <SelectItem value="poor">Scarsa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tread_depth" className="text-gray-700">
                    Battistrada (mm)
                  </Label>
                  <Input
                    id="tread_depth"
                    type="number"
                    step="0.1"
                    value={formData.tread_depth}
                    onChange={(e) => handleInputChange("tread_depth", e.target.value)}
                    placeholder="es. 8.0"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_price" className="text-gray-700">
                    Prezzo (€)
                  </Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                    placeholder="es. 120.00"
                    className="bg-white border-gray-300"
                  />
                </div>

                {/* Deposit Type */}
                <div className="space-y-2">
                  <Label htmlFor="deposit_type" className="text-gray-700">
                    Tipo Deposito
                  </Label>
                  <Select
                    value={formData.deposit_type}
                    onValueChange={(value) => handleInputChange("deposit_type", value)}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attivo</SelectItem>
                      <SelectItem value="stored">In Deposito</SelectItem>
                      <SelectItem value="installed">Installato</SelectItem>
                      <SelectItem value="disposed">Smaltito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700">
                    Stato
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attivo</SelectItem>
                      <SelectItem value="stored">In Deposito</SelectItem>
                      <SelectItem value="installed">Installato</SelectItem>
                      <SelectItem value="disposed">Smaltito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage Date */}
                <div className="space-y-2">
                  <Label htmlFor="storage_date" className="text-gray-700">
                    Data Deposito
                  </Label>
                  <Input
                    id="storage_date"
                    type="date"
                    value={formData.storage_date}
                    onChange={(e) => handleInputChange("storage_date", e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>

                {/* Installation Date */}
                <div className="space-y-2">
                  <Label htmlFor="installation_date" className="text-gray-700">
                    Data Installazione
                  </Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => handleInputChange("installation_date", e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>

                {/* Removal Date */}
                <div className="space-y-2">
                  <Label htmlFor="removal_date" className="text-gray-700">
                    Data Rimozione
                  </Label>
                  <Input
                    id="removal_date"
                    type="date"
                    value={formData.removal_date}
                    onChange={(e) => handleInputChange("removal_date", e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>

              {/* Warehouse Position */}
              <div className="space-y-2">
                <Label htmlFor="warehouse_position_id" className="text-gray-700">
                  Posizione Magazzino
                </Label>
                <Select
                  value={formData.warehouse_position_id}
                  onValueChange={(value) => handleInputChange("warehouse_position_id", value)}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Seleziona posizione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuna posizione specifica</SelectItem>
                    {Array.isArray(warehousePositions) &&
                      warehousePositions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {position.position_code} - {position.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700">
                  Note
                </Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Note aggiuntive..."
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/clients/${clientId}`)}
                  className="flex-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-gray-900 text-white hover:bg-gray-800">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Aggiungendo...
                    </>
                  ) : (
                    "Aggiungi Pneumatico"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
