"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Car, Upload } from "lucide-react"

interface Vehicle {
  id: number
  license_plate: string
  make: string
  model: string
  year: number
  fuel_type: string
  color: string
  current_km: number
  image_urls: string
}

export default function EditVehiclePage({ params }: { params: { id: string; vehicleId: string } }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchVehicleDetails()
  }, [params.vehicleId])

  const fetchVehicleDetails = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.vehicleId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle details")
      }
      const data = await response.json()
      setVehicle(data)
    } catch (error) {
      console.error("Error fetching vehicle:", error)
      setError("Errore nel caricamento dei dettagli del veicolo")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)

    console.log("[v0] Edit form submission started for vehicle:", params.vehicleId)
    console.log("[v0] FormData entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`[v0] ${key}:`, typeof value === "object" ? `File(${(value as File).name})` : value)
    }

    try {
      console.log("[v0] Making PUT request to:", `/api/vehicles/${params.vehicleId}`)
      const response = await fetch(`/api/vehicles/${params.vehicleId}`, {
        method: "PUT",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (response.ok) {
        const responseData = await response.json()
        console.log("[v0] Update successful, response data:", responseData)
        setSuccess("Veicolo aggiornato con successo!")
        setTimeout(() => {
          window.location.href = `/clients/${params.id}`
        }, 2000)
      } else {
        const errorData = await response.text()
        console.log("[v0] Update failed, error data:", errorData)
        throw new Error("Failed to update vehicle")
      }
    } catch (error) {
      console.error("[v0] Error updating vehicle:", error)
      setError("Errore durante l'aggiornamento del veicolo")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dettagli veicolo...</p>
        </div>
      </div>
    )
  }

  if (error && !vehicle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto border-red-200 bg-white">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href={`/clients/${params.id}`}>
              <Button variant="outline" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna al Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/clients/${params.id}`}>
              <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Modifica Veicolo</h1>
                <p className="text-sm text-gray-600">{vehicle?.license_plate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Car className="w-5 h-5" />
              Informazioni Veicolo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_plate">Targa *</Label>
                  <Input
                    id="license_plate"
                    name="license_plate"
                    defaultValue={vehicle?.license_plate}
                    required
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="make">Marca *</Label>
                  <Input id="make" name="make" defaultValue={vehicle?.make} required className="bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="model">Modello *</Label>
                  <Input id="model" name="model" defaultValue={vehicle?.model} required className="bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="year">Anno *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1900"
                    max="2030"
                    defaultValue={vehicle?.year}
                    required
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel_type">Carburante</Label>
                  <Select name="fuel_type" defaultValue={vehicle?.fuel_type}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="Seleziona carburante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Benzina">Benzina</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="GPL">GPL</SelectItem>
                      <SelectItem value="Metano">Metano</SelectItem>
                      <SelectItem value="Elettrico">Elettrico</SelectItem>
                      <SelectItem value="Ibrido">Ibrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Colore</Label>
                  <Input id="color" name="color" defaultValue={vehicle?.color} className="bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="current_km">Chilometraggio (Km)</Label>
                  <Input
                    id="current_km"
                    name="current_km"
                    type="number"
                    min="0"
                    defaultValue={vehicle?.current_km}
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="carPicture">Foto Veicolo (opzionale)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="carPicture" name="carPicture" type="file" accept="image/*" className="bg-gray-50" />
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? "Aggiornamento..." : "Aggiorna Veicolo"}
                </Button>
                <Link href={`/clients/${params.id}`}>
                  <Button type="button" variant="outline" className="bg-transparent">
                    Annulla
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
