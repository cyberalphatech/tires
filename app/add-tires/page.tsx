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
  make: string
  model: string
  client_id: number
}

interface WarehousePosition {
  id: number
  position_code: string
  description: string
}

export default function AddTiresPage() {
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [warehousePositions, setWarehousePositions] = useState<WarehousePosition[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    client_id: "",
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
    position: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get bodyshop ID from localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        const bodyshopId = user.id

        // Fetch clients
        const clientsResponse = await fetch(`/api/bodyshop/${bodyshopId}/clients`)
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        }

        // Fetch vehicles
        const vehiclesResponse = await fetch(`/api/bodyshop/${bodyshopId}/vehicles`)
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          setVehicles(vehiclesData)
        }

        // Fetch warehouse positions
        const positionsResponse = await fetch(`/api/warehouse/positions?bodyshop_id=${bodyshopId}`)
        if (positionsResponse.ok) {
          const positionsData = await positionsResponse.json()
          setWarehousePositions(positionsData)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Errore nel caricamento dei dati")
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
      const response = await fetch("/api/tires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          client_id: formData.client_id ? Number.parseInt(formData.client_id) : null,
          vehicle_id: formData.vehicle_id ? Number.parseInt(formData.vehicle_id) : null,
          warehouse_position_id: formData.warehouse_position_id
            ? Number.parseInt(formData.warehouse_position_id)
            : null,
          tread_depth: formData.tread_depth ? Number.parseFloat(formData.tread_depth) : null,
          purchase_price: formData.purchase_price ? Number.parseFloat(formData.purchase_price) : null,
        }),
      })

      if (response.ok) {
        setSuccess("Pneumatico aggiunto con successo!")
        // Reset form
        setFormData({
          client_id: "",
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
          position: "",
        })
        setTimeout(() => {
          setSuccess("")
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Errore durante l'aggiunta del pneumatico")
      }
    } catch (error) {
      setError("Errore di connessione")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Filter vehicles based on selected client
  const filteredVehicles = vehicles.filter(
    (vehicle) => !formData.client_id || vehicle.client_id.toString() === formData.client_id,
  )

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
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aggiungi Pneumatico</h1>
            <p className="text-gray-600">Inserisci un nuovo pneumatico nel sistema</p>
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
              {/* Client and Vehicle Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id" className="text-gray-700">
                    Cliente *
                  </Label>
                  <Select value={formData.client_id} onValueChange={(value) => handleInputChange("client_id", value)}>
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue placeholder="Seleziona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.first_name} {client.last_name} ({client.client_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      {filteredVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                    {warehousePositions.map((position) => (
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
                  onClick={() => router.push("/dashboard")}
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
