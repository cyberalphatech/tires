"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Search, User, Car, Phone, Mail, MapPin, Trash2 } from "lucide-react"

interface Client {
  id: number
  bodyshop_id: number
  client_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  tax_code: string
  vehicle_count: number
  tire_count: number
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [bodyshopId, setBodyshopId] = useState<string>("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; clientId: number | null; clientName: string }>({
    show: false,
    clientId: null,
    clientName: "",
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    console.log("[v0] Raw userData from localStorage:", userData) // Added debug logging

    if (userData) {
      try {
        const user = JSON.parse(userData)
        console.log("[v0] Parsed user object:", user) // Added debug logging

        const userId = user.id || user.customer_id || user.bodyshop_id || user.userId
        console.log("[v0] Extracted userId:", userId) // Added debug logging

        if (userId) {
          setBodyshopId(userId.toString())
        } else {
          console.log("[v0] No valid ID found in user data") // Added debug logging
          setError("ID bodyshop non trovato. Effettua nuovamente il login.")
          setLoading(false)
        }
      } catch (error) {
        console.error("[v0] Error parsing user data:", error) // Added debug logging
        setError("Errore nell'autenticazione. Effettua nuovamente il login.")
        setLoading(false)
      }
    } else {
      console.log("[v0] No userData found in localStorage") // Added debug logging
      setError("Sessione scaduta. Effettua nuovamente il login.")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (bodyshopId) {
      fetchClients()
    }
  }, [bodyshopId])

  const fetchClients = async () => {
    try {
      console.log("[v0] Fetching clients for bodyshop ID:", bodyshopId) // Added debug logging
      const response = await fetch(`/api/bodyshop/${bodyshopId}/clients`)
      console.log("[v0] API response status:", response.status) // Added debug logging

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText) // Added debug logging
        throw new Error(`Failed to fetch clients: ${response.status}`)
      }
      const data = await response.json()
      console.log("[v0] Fetched clients data:", data) // Added debug logging
      setClients(data)
    } catch (error) {
      console.error("[v0] Error fetching clients:", error) // Enhanced error logging
      setError("Errore nel caricamento dei clienti")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    try {
      console.log("[v0] Deleting client ID:", clientId)
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Delete API error:", errorText)
        throw new Error(`Failed to delete client: ${response.status}`)
      }

      console.log("[v0] Client deleted successfully")
      // Refresh clients list
      await fetchClients()
      setDeleteConfirm({ show: false, clientId: null, clientName: "" })
    } catch (error) {
      console.error("[v0] Error deleting client:", error)
      setError("Errore nell'eliminazione del cliente")
    }
  }

  const showDeleteConfirm = (clientId: number, clientName: string) => {
    setDeleteConfirm({ show: true, clientId, clientName })
  }

  const filteredClients = clients.filter(
    (client) =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.client_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-cyan-600">Caricamento clienti...</p>
        </div>
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestione Clienti</h1>
                  <p className="text-sm text-gray-600">Visualizza e gestisci tutti i clienti</p>
                </div>
              </div>
            </div>

            <Link href="/new-customer">
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <User className="w-4 h-4 mr-2" />
                Nuovo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Search Bar */}
        <Card className="mb-6 bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca per nome, email, telefono o codice cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600">{clients.length}</div>
              <div className="text-sm text-gray-600">Clienti Totali</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {clients.reduce((sum, client) => sum + (client.vehicle_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Veicoli Totali</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {clients.reduce((sum, client) => sum + (client.tire_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Pneumatici Totali</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredClients.length}</div>
              <div className="text-sm text-gray-600">Risultati Ricerca</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "Nessun cliente trovato" : "Nessun cliente registrato"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Prova a modificare i termini di ricerca" : "Inizia aggiungendo il tuo primo cliente"}
              </p>
              {!searchTerm && (
                <Link href="/new-customer">
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <User className="w-4 h-4 mr-2" />
                    Aggiungi Cliente
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-200 hover:border-cyan-200 bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {client.first_name} {client.last_name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                        <Car className="w-3 h-3 mr-1" />
                        {client.vehicle_count || 0}
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {client.tire_count || 0} gomme
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">Codice: {client.client_code}</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  {client.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {client.city}
                        {client.postal_code && ` (${client.postal_code})`}
                      </span>
                    </div>
                  )}
                  {client.tax_code && <div className="text-xs text-gray-500">CF: {client.tax_code}</div>}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Cliente dal {new Date(client.created_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                        Visualizza
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => showDeleteConfirm(client.id, `${client.first_name} ${client.last_name}`)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-600">Conferma Eliminazione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Sei sicuro di voler eliminare il cliente <strong>{deleteConfirm.clientName}</strong>?
                </p>
                <p className="text-sm text-red-600">
                  Questa azione non può essere annullata e eliminerà tutti i dati associati al cliente.
                </p>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setDeleteConfirm({ show: false, clientId: null, clientName: "" })}
                  >
                    Annulla
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => deleteConfirm.clientId && handleDeleteClient(deleteConfirm.clientId)}
                  >
                    Elimina
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
