"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Car, Phone, Mail, MapPin, Calendar, Settings, Wrench, Plus, Edit, Trash2 } from "lucide-react"

interface ClientDetails {
  id: number
  client_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  tax_code: string
  created_at: string
  vehicles: Array<{
    id: number
    license_plate: string
    make: string
    model: string
    year: number
    tire_count: number
  }>
  tires: Array<{
    id: number
    brand: string
    model: string
    size: string
    season: string
    position: string
    condition: string
    dot_code: string
    tread_depth: number
    vehicle_license_plate: string
    storage_location: string
    deposit_type: string
    status: string
    storage_date: string
    installation_date: string
    removal_date: string
    created_at: string
    bodyshop_id: number
  }>
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<ClientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTires, setSelectedTires] = useState<number[]>([])
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false)
  const [warehouseAssignments, setWarehouseAssignments] = useState<
    Array<{
      tireId: number
      warehouseLocationId: number
      positionCode: string
      tireBrand: string
      tireSize: string
    }>
  >([])
  const [availablePositions, setAvailablePositions] = useState<
    Array<{
      id: number
      position_code: string
      description: string
    }>
  >([])
  const [showTireSetDialog, setShowTireSetDialog] = useState(false)
  const [tireSetForm, setTireSetForm] = useState({
    name: "",
    season: "",
    vehicle_id: "",
    color: "#3B82F6",
  })
  const [tireSets, setTireSets] = useState<any[]>([])
  const router = useRouter()

  const fetchClientDetails = useCallback(async () => {
    try {
      console.log("[v0] Fetching client details for ID:", params.id)
      setLoading(true)
      setError("")

      const response = await fetch(`/api/clients/${params.id}/details`)
      console.log("[v0] API response status:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Raw API response data:", data)

      const clientData = {
        id: data.id || Number.parseInt(params.id),
        client_code: data.client_code || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        postal_code: data.postal_code || "",
        tax_code: data.tax_code || "",
        created_at: data.created_at || new Date().toISOString(),
        vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
        tires: Array.isArray(data.tires) ? data.tires : [],
      }

      console.log("[v0] Processed client data:", clientData)
      console.log("[v0] Tires array length:", clientData.tires.length)

      setClient(clientData)
      setError("")
    } catch (error) {
      console.error("[v0] Error fetching client details:", error)
      setError("Errore nel caricamento dei dettagli cliente")
      setClient({
        id: Number.parseInt(params.id),
        client_code: "",
        first_name: "Cliente",
        last_name: "Non Trovato",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        tax_code: "",
        created_at: new Date().toISOString(),
        vehicles: [],
        tires: [],
      })
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchClientDetails()
  }, [fetchClientDetails])

  const fetchAvailablePositions = useCallback(async () => {
    try {
      console.log("[v0] === FETCH AVAILABLE POSITIONS DEBUG START ===")

      if (!client) {
        console.log("[v0] ❌ No client data available for fetching warehouse positions")
        return []
      }

      let bodyshopId = 3 // Default fallback
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          bodyshopId = user.id || 3 // Use logged-in user's bodyshop ID
          console.log("[v0] Got bodyshop_id from user data:", bodyshopId)
        }
      } catch (e) {
        console.log("[v0] Could not get user data from localStorage, using default bodyshop_id:", bodyshopId)
      }

      console.log("[v0] Client data:", {
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
      })
      console.log("[v0] Using bodyshop_id:", bodyshopId)

      const apiUrl = `/api/warehouse/positions/available?bodyshop_id=${bodyshopId}`
      console.log("[v0] API URL:", apiUrl)

      const response = await fetch(apiUrl)
      console.log("[v0] Warehouse positions API response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] ✅ API Response successful")
        console.log("[v0] Raw API response data:", data)
        console.log("[v0] Positions array:", data.positions)
        console.log("[v0] Positions count:", data.positions?.length || 0)

        const positions = data.positions || []
        setAvailablePositions(positions)
        console.log("[v0] Set available positions state to:", positions)

        console.log("[v0] === FETCH AVAILABLE POSITIONS DEBUG END ===")
        return positions
      } else {
        console.error("[v0] ❌ API Response failed")
        console.error("[v0] Status:", response.status, response.statusText)

        try {
          const errorData = await response.json()
          console.error("[v0] Error response data:", errorData)
        } catch (e) {
          console.error("[v0] Could not parse error response as JSON")
        }

        console.log("[v0] === FETCH AVAILABLE POSITIONS DEBUG END ===")
        return []
      }
    } catch (error) {
      console.error("[v0] ❌ Exception in fetchAvailablePositions:", error)
      console.error("[v0] Error stack:", error.stack)
      return []
    }
  }, [client])

  const handleAddVehicle = () => {
    window.location.href = `/clients/${params.id}/add-vehicle`
  }

  const handleAddTires = () => {
    window.location.href = `/clients/${params.id}/add-tires`
  }

  const handleEditVehicle = (vehicleId: number) => {
    window.location.href = `/clients/${params.id}/vehicle/${vehicleId}/edit`
  }

  const handleDeleteVehicle = async (vehicleId: number, licensePlate: string) => {
    if (confirm(`Sei sicuro di voler eliminare il veicolo ${licensePlate}?`)) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Refresh client details to update the vehicle list
          fetchClientDetails()
        } else {
          const errorData = await response.json()
          alert(`Errore durante l'eliminazione del veicolo: ${errorData.error || "Errore sconosciuto"}`)
        }
      } catch (error) {
        console.error("Error deleting vehicle:", error)
        alert("Errore durante l'eliminazione del veicolo")
      }
    }
  }

  const handleTireSelection = (tireId: number, checked: boolean) => {
    if (checked) {
      setSelectedTires([...selectedTires, tireId])
    } else {
      setSelectedTires(selectedTires.filter((id) => id !== tireId))
    }
  }

  const handleBulkAction = async (action: string) => {
    console.log("[v0] === BULK ACTION DEBUG START ===")
    console.log("[v0] Action:", action)
    console.log("[v0] Selected tires:", selectedTires)
    console.log("[v0] Selected tires count:", selectedTires.length)

    if (selectedTires.length === 0) {
      alert("Seleziona almeno un pneumatico")
      return
    }

    if (action === "dispose") {
      const confirmDispose = confirm(
        `⚠️ ATTENZIONE: Stai per smaltire definitivamente ${selectedTires.length} pneumatici.\n\nQuesta azione:\n- Cambierà lo status in "scrapped"\n- Rimuoverà la posizione magazzino\n- NON può essere annullata\n\nSei sicuro di voler procedere?`,
      )

      if (!confirmDispose) {
        console.log("[v0] SMALTIRE action cancelled by user")
        return
      }
    }

    if (action === "remove_and_store") {
      console.log("[v0] Starting SMONTARE + DEPOSITO process...")

      const selectedTireDetails = selectedTires.map((tireId) => {
        const tire = client?.tires.find((t) => t.id === tireId)
        return {
          id: tireId,
          brand: tire?.brand,
          status: tire?.status,
          warehouse_location: tire?.storage_location,
        }
      })
      console.log("[v0] Selected tire details:", selectedTireDetails)

      console.log("[v0] Fetching available positions...")
      const fetchedPositions = await fetchAvailablePositions()

      console.log("[v0] Fetched positions directly:", fetchedPositions)
      console.log("[v0] Fetched positions count:", fetchedPositions.length)
      console.log("[v0] Required positions:", selectedTires.length)

      const availableCount = fetchedPositions.length
      const requiredCount = selectedTires.length
      console.log("[v0] Comparison - Available:", availableCount, "Required:", requiredCount)
      console.log("[v0] Has enough positions?", availableCount >= requiredCount)

      if (fetchedPositions.length < selectedTires.length) {
        console.log("[v0] ❌ NOT ENOUGH POSITIONS - Showing alert")
        console.log(
          "[v0] Alert message will be:",
          `Non ci sono abbastanza posizioni disponibili. Disponibili: ${fetchedPositions.length}, Richieste: ${selectedTires.length}`,
        )

        alert(
          `Non ci sono abbastanza posizioni disponibili. Disponibili: ${fetchedPositions.length}, Richieste: ${selectedTires.length}`,
        )
        return
      }

      console.log("[v0] ✅ ENOUGH POSITIONS - Proceeding with assignments")

      // Create automatic assignments using fetched positions
      const assignments = selectedTires.map((tireId, index) => {
        const tire = client?.tires.find((t) => t.id === tireId)
        return {
          tireId,
          warehouseLocationId: fetchedPositions[index].id,
          positionCode: fetchedPositions[index].position_code,
          tireBrand: tire?.brand || "",
          tireSize: tire?.size || "",
        }
      })

      setWarehouseAssignments(assignments)
      setShowWarehouseDialog(true)
      return
    }

    const actionText =
      {
        install: "installare",
        remove: "smontare",
        dispose: "smaltire",
        store: "depositare",
      }[action] || action

    if (
      action !== "dispose" &&
      confirm(`Sei sicuro di voler ${actionText} ${selectedTires.length} pneumatici selezionati?`)
    ) {
      try {
        console.log("[v0] Executing bulk action:", action)
        console.log("[v0] Request payload:", {
          tireIds: selectedTires,
          action: action,
          bodyshopId: client?.id || 3,
        })

        const response = await fetch("/api/tires/bulk-action", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tireIds: selectedTires,
            action: action,
            bodyshopId: client?.id || 3,
          }),
        })

        console.log("[v0] API response status:", response.status)

        if (response.ok) {
          const result = await response.json()
          console.log("[v0] Success result:", result)

          const successMessage =
            action === "dispose"
              ? `${selectedTires.length} pneumatici smaltiti definitivamente`
              : `Azione "${actionText}" eseguita su ${selectedTires.length} pneumatici`

          alert(successMessage)
          setSelectedTires([])
          fetchClientDetails() // Refresh data
        } else {
          const errorData = await response.json()
          console.error("[v0] API error:", errorData)
          alert(`Errore durante l'azione "${actionText}": ${errorData.error}`)
        }
      } catch (error) {
        console.error(`[v0] Error performing bulk ${action}:`, error)
        alert(`Errore durante l'azione "${actionText}"`)
      }
    } else if (action === "dispose") {
      try {
        console.log("[v0] Executing SMALTIRE action")
        console.log("[v0] Request payload:", {
          tireIds: selectedTires,
          action: action,
          bodyshopId: client?.id || 3,
        })

        const response = await fetch("/api/tires/bulk-action", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tireIds: selectedTires,
            action: action,
            bodyshopId: client?.id || 3,
          }),
        })

        console.log("[v0] SMALTIRE API response status:", response.status)

        if (response.ok) {
          const result = await response.json()
          console.log("[v0] SMALTIRE success result:", result)
          alert(`${selectedTires.length} pneumatici smaltiti definitivamente`)
          setSelectedTires([])
          fetchClientDetails() // Refresh data
        } else {
          const errorData = await response.json()
          console.error("[v0] SMALTIRE API error:", errorData)
          alert(`Errore durante lo smaltimento: ${errorData.error}`)
        }
      } catch (error) {
        console.error("[v0] Error performing SMALTIRE:", error)
        alert("Errore durante lo smaltimento")
      }
    }
  }

  const handleWarehouseAssignmentChange = (tireId: number, newWarehouseLocationId: number) => {
    const newPosition = availablePositions.find((pos) => pos.id === newWarehouseLocationId)
    if (!newPosition) return

    setWarehouseAssignments((prev) =>
      prev.map((assignment) =>
        assignment.tireId === tireId
          ? { ...assignment, warehouseLocationId: newWarehouseLocationId, positionCode: newPosition.position_code }
          : assignment,
      ),
    )
  }

  const confirmWarehouseAssignments = async () => {
    try {
      console.log("[v0] === WAREHOUSE ASSIGNMENT CONFIRMATION DEBUG START ===")
      console.log("[v0] Selected tires:", selectedTires)
      console.log("[v0] Selected tires count:", selectedTires.length)
      console.log("[v0] Warehouse assignments:", warehouseAssignments)

      let bodyshopId = 3 // Default fallback
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const user = JSON.parse(userData)
          bodyshopId = user.id || 3 // Use logged-in user's bodyshop ID
        }
      } catch (e) {
        console.log("[v0] Could not get user data from localStorage, using default bodyshop_id:", bodyshopId)
      }

      console.log("[v0] Using bodyshop_id:", bodyshopId)

      // Log each assignment in detail
      warehouseAssignments.forEach((assignment, index) => {
        console.log(`[v0] Assignment ${index + 1}:`, {
          tireId: assignment.tireId,
          warehouseLocationId: assignment.warehouseLocationId,
          positionCode: assignment.positionCode,
          tireBrand: assignment.tireBrand,
          tireSize: assignment.tireSize,
        })
      })

      const requestPayload = {
        tireIds: selectedTires,
        action: "remove_and_store",
        bodyshopId: bodyshopId, // Use user's bodyshop_id instead of client.id
        warehouseAssignments: warehouseAssignments,
      }

      console.log("[v0] Complete request payload:", JSON.stringify(requestPayload, null, 2))
      console.log("[v0] API endpoint: /api/tires/bulk-action")
      console.log("[v0] Request method: POST")
      console.log("[v0] Request headers: Content-Type: application/json")

      const response = await fetch("/api/tires/bulk-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      console.log("[v0] API response status:", response.status, response.statusText)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] ✅ SUCCESS - API response data:", result)
        console.log("[v0] === WAREHOUSE ASSIGNMENT CONFIRMATION DEBUG END ===")

        alert(`${selectedTires.length} pneumatici smontati e depositati con successo`)
        setSelectedTires([])
        setShowWarehouseDialog(false)
        setWarehouseAssignments([])
        fetchClientDetails() // Refresh data
      } else {
        console.log("[v0] ❌ ERROR - API response failed")

        try {
          const errorData = await response.json()
          console.log("[v0] Error response data:", errorData)
          console.log("[v0] Error message:", errorData.error)
          console.log("[v0] === WAREHOUSE ASSIGNMENT CONFIRMATION DEBUG END ===")
          alert(`Errore durante l'operazione: ${errorData.error}`)
        } catch (parseError) {
          console.log("[v0] Could not parse error response as JSON")
          console.log("[v0] Raw error response:", await response.text())
          console.log("[v0] === WAREHOUSE ASSIGNMENT CONFIRMATION DEBUG END ===")
          alert("Errore durante l'operazione")
        }
      }
    } catch (error) {
      console.error("[v0] ❌ EXCEPTION in confirmWarehouseAssignments:", error)
      console.error("[v0] Error stack:", error.stack)
      console.log("[v0] === WAREHOUSE ASSIGNMENT CONFIRMATION DEBUG END ===")
      alert("Errore durante l'operazione")
    }
  }

  const handleCreateTireSet = async () => {
    try {
      console.log("[v0] Creating tire set:", tireSetForm)

      const response = await fetch("/api/tire-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...tireSetForm,
          client_id: params.id,
          tire_ids: selectedTires,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create tire set")
      }

      const result = await response.json()
      console.log("[v0] Tire set created:", result)

      setShowTireSetDialog(false)
      setTireSetForm({ name: "", season: "", vehicle_id: "", color: "#3B82F6" })
      setSelectedTires([])
      fetchClientDetails() // Refresh data

      alert("Set di pneumatici creato con successo!")
    } catch (error) {
      console.error("[v0] Error creating tire set:", error)
      alert("Errore nella creazione del set di pneumatici")
    }
  }

  const handleEditTire = (tireId: number) => {
    console.log("[v0] Editing tire:", tireId)
    router.push(`/clients/${params.id}/edit-tire/${tireId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dettagli cliente...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto border-red-200 bg-white">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Cliente non trovato"}</p>
            <Link href="/clients">
              <Button variant="outline" className="bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna ai Clienti
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/clients">
                <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Clienti
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {client.first_name} {client.last_name}
                  </h1>
                  <p className="text-sm text-gray-600">Codice Cliente: {client.client_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Client Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" />
                Informazioni Personali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{client.email || "Non specificato"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  {client.address && `${client.address}, `}
                  {client.city}
                  {client.postal_code && ` ${client.postal_code}`}
                </span>
              </div>
              {client.tax_code && (
                <div className="text-sm">
                  <span className="text-gray-500">Codice Fiscale: </span>
                  <span className="text-gray-900 font-mono">{client.tax_code}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  Cliente dal {new Date(client.created_at).toLocaleDateString("it-IT")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Car className="w-5 h-5" />
                Veicoli
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{(client.vehicles || []).length}</div>
                <div className="text-sm text-gray-600">Veicoli Registrati</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Settings className="w-5 h-5" />
                Pneumatici
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{(client.tires || []).length}</div>
                <div className="text-sm text-gray-600">Pneumatici in Deposito</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles Section */}
        <Card className="mb-6 bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Car className="w-5 h-5" />
                Veicoli del Cliente
              </CardTitle>
              <Button onClick={handleAddVehicle} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                AGGIUNGI VEICOLO
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!client.vehicles || client.vehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun veicolo registrato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="border border-gray-200 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{vehicle.license_plate}</h3>
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                          {vehicle.tire_count} gomme
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500">Anno: {vehicle.year}</p>
                      <div className="mt-3 space-y-2">
                        <Link href={`/clients/${params.id}/vehicle/${vehicle.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-300 bg-transparent hover:bg-gray-100"
                          >
                            <Car className="w-4 h-4 mr-2" />
                            Visualizza Dettagli
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-300 bg-transparent hover:bg-blue-50 text-blue-600"
                            onClick={() => handleEditVehicle(vehicle.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modifica
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-300 bg-transparent hover:bg-red-50 text-red-600"
                            onClick={() => handleDeleteVehicle(vehicle.id, vehicle.license_plate)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tires Section */}
        {selectedTires.length > 0 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            <Button
              onClick={() => handleBulkAction("install")}
              className="bg-blue-600 hover:bg-blue-700 text-white border border-black"
            >
              INSTALLARE
            </Button>
            <Button
              onClick={() => handleBulkAction("remove")}
              className="bg-gray-600 hover:bg-gray-700 text-white border border-black"
            >
              SMONTARE
            </Button>
            <Button
              onClick={() => handleBulkAction("dispose")}
              className="bg-red-600 hover:bg-red-700 text-white border border-black"
            >
              SMALTIRE
            </Button>
            <Button
              onClick={() => handleBulkAction("remove_and_store")}
              className="bg-green-600 hover:bg-green-700 text-white border border-black"
            >
              SMONTARE + DEPOSITO
            </Button>
            <Button
              onClick={() => setShowTireSetDialog(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white border border-black"
            >
              CREA SET PNEUMATICI
            </Button>
          </div>
        )}

        {/* Pneumatici Montati (Installed Tires) */}
        <Card className="mb-6 bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Wrench className="w-5 h-5" />
                Pneumatici Montati ({client.tires?.filter((tire) => tire.status === "in_use").length || 0})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!client.tires || client.tires.filter((tire) => tire.status === "in_use").length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun pneumatico montato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.tires
                  .filter((tire) => tire.status === "in_use")
                  .map((tire) => (
                    <Card key={tire.id} className="border-2 border-green-300 bg-green-50 shadow-md p-2">
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="border-green-300 text-green-700 bg-green-100">
                                {tire.status}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`${
                                  tire.season === "winter"
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : tire.season === "summer"
                                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                                      : "bg-gray-100 text-gray-700 border border-gray-300"
                                }`}
                              >
                                {tire.season}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{tire.brand}</h3>
                            <p className="text-gray-700 mb-2">{tire.model}</p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <strong>Battistrada:</strong> {tire.tread_depth}mm
                              </p>
                              <p>
                                <strong>Condizione:</strong> {tire.condition}
                              </p>
                              {tire.vehicle_license_plate && (
                                <p>
                                  <strong>Targa:</strong> {tire.vehicle_license_plate}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTire(tire.id)}
                              className="bg-white hover:bg-gray-50 border-gray-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Checkbox
                              checked={selectedTires.includes(tire.id)}
                              onCheckedChange={(checked) => handleTireSelection(tire.id, checked as boolean)}
                              className="w-5 h-5 border-2 border-gray-400"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pneumatici in Deposito (Stored Tires) */}
        <Card className="mb-6 bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Wrench className="w-5 h-5" />
                Pneumatici in Deposito ({client.tires?.filter((tire) => tire.status === "stored").length || 0})
              </CardTitle>
              <Button onClick={handleAddTires} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi pneumatici
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!client.tires || client.tires.filter((tire) => tire.status === "stored").length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun pneumatico in deposito</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.tires
                  .filter((tire) => tire.status === "stored")
                  .map((tire) => (
                    <Card key={tire.id} className="border-2 border-blue-300 bg-white shadow-md p-2">
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-100">
                                {tire.status}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`${
                                  tire.season === "winter"
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : tire.season === "summer"
                                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                                      : "bg-gray-100 text-gray-700 border border-gray-300"
                                }`}
                              >
                                {tire.season}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{tire.brand}</h3>
                            <p className="text-gray-700 mb-2">{tire.size}</p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <strong>Battistrada:</strong> {tire.tread_depth}mm
                              </p>
                              <p>
                                <strong>Condizione:</strong> {tire.condition}
                              </p>
                              {tire.vehicle_license_plate && (
                                <p>
                                  <strong>Targa:</strong> {tire.vehicle_license_plate}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{tire.storage_location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {tire.storage_date ? new Date(tire.storage_date).toLocaleDateString("it-IT") : "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTire(tire.id)}
                              className="bg-white hover:bg-gray-50 border-gray-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Checkbox
                              checked={selectedTires.includes(tire.id)}
                              onCheckedChange={(checked) => handleTireSelection(tire.id, checked as boolean)}
                              className="w-5 h-5 border-2 border-gray-400"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pneumatici Consegnati (Delivered/Dispatched Tires) */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Wrench className="w-5 h-5" />
              Pneumatici Consegnati (
              {client.tires?.filter((tire) => tire.status === "scrapped" || tire.status === "sold").length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!client.tires ||
            client.tires.filter((tire) => tire.status === "scrapped" || tire.status === "sold").length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun pneumatico consegnato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.tires
                  .filter((tire) => tire.status === "scrapped" || tire.status === "sold")
                  .map((tire) => (
                    <Card key={tire.id} className="border-2 border-gray-300 bg-gray-50 shadow-md p-2">
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="border-gray-400 text-gray-700 bg-gray-200">
                                {tire.status}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`${
                                  tire.season === "winter"
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : tire.season === "summer"
                                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                                      : "bg-gray-100 text-gray-700 border border-gray-300"
                                }`}
                              >
                                {tire.season}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{tire.brand}</h3>
                            <p className="text-gray-700 mb-2">{tire.size}</p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <strong>Battistrada:</strong> {tire.tread_depth}mm
                              </p>
                              <p>
                                <strong>Condizione:</strong> {tire.condition}
                              </p>
                              {tire.vehicle_license_plate && (
                                <p>
                                  <strong>Targa:</strong> {tire.vehicle_license_plate}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTire(tire.id)}
                              className="bg-white hover:bg-gray-50 border-gray-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Checkbox
                              checked={selectedTires.includes(tire.id)}
                              onCheckedChange={(checked) => handleTireSelection(tire.id, checked as boolean)}
                              className="w-5 h-5 border-2 border-gray-400"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Assignment Dialog */}
      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assegnazione Posizioni Magazzino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600">
              Conferma o modifica le posizioni di magazzino per i pneumatici selezionati:
            </p>
            {warehouseAssignments.map((assignment) => (
              <div key={assignment.tireId} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{assignment.tireBrand}</p>
                  <p className="text-sm text-gray-600">{assignment.tireSize}</p>
                </div>
                <div className="flex-1">
                  <Select
                    value={assignment.warehouseLocationId.toString()}
                    onValueChange={(value) =>
                      handleWarehouseAssignmentChange(assignment.tireId, Number.parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.map((position) => (
                        <SelectItem key={position.id} value={position.id.toString()}>
                          {position.position_code} - {position.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarehouseDialog(false)}>
              Annulla
            </Button>
            <Button onClick={confirmWarehouseAssignments} className="bg-green-600 hover:bg-green-700">
              Conferma Assegnazioni
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tire Set Creation Dialog */}
      {showTireSetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Crea Set di Pneumatici</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Set</label>
                <input
                  type="text"
                  value={tireSetForm.name}
                  onChange={(e) => setTireSetForm({ ...tireSetForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Es: Set Invernale 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stagione</label>
                <select
                  value={tireSetForm.season}
                  onChange={(e) => setTireSetForm({ ...tireSetForm, season: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleziona stagione</option>
                  <option value="summer">Estiva</option>
                  <option value="winter">Invernale</option>
                  <option value="all_season">4 Stagioni</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Veicolo</label>
                <select
                  value={tireSetForm.vehicle_id}
                  onChange={(e) => setTireSetForm({ ...tireSetForm, vehicle_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleziona veicolo</option>
                  {client?.vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Colore Set</label>
                <div className="flex gap-2">
                  {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTireSetForm({ ...tireSetForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        tireSetForm.color === color ? "border-gray-800" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600">Pneumatici selezionati: {selectedTires.length}</div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowTireSetDialog(false)} variant="outline" className="flex-1">
                Annulla
              </Button>
              <Button
                onClick={handleCreateTireSet}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!tireSetForm.name || !tireSetForm.season || selectedTires.length === 0}
              >
                Crea Set
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
