"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"

export default function EditTirePage({ params }: { params: { id: string; tireId: string } }) {
  const router = useRouter()
  const [tire, setTire] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    size: "",
    season: "",
    tread_depth: "",
    condition: "",
    position: "",
    status: "",
  })

  useEffect(() => {
    fetchTireDetails()
  }, [])

  const fetchTireDetails = async () => {
    try {
      const response = await fetch(`/api/tires/${params.tireId}`)
      if (!response.ok) throw new Error("Failed to fetch tire")

      const tireData = await response.json()
      setTire(tireData)
      setFormData({
        brand: tireData.brand || "",
        model: tireData.model || "",
        size: tireData.size || "",
        season: tireData.season || "",
        tread_depth: tireData.tread_depth || "",
        condition: tireData.condition || "",
        position: tireData.position || "",
        status: tireData.status || "",
      })
    } catch (error) {
      console.error("Error fetching tire:", error)
      alert("Errore nel caricamento del pneumatico")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/tires/${params.tireId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to update tire")

      alert("Pneumatico aggiornato con successo!")
      router.back()
    } catch (error) {
      console.error("Error updating tire:", error)
      alert("Errore nell'aggiornamento del pneumatico")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Caricamento...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </Button>
          <h1 className="text-2xl font-bold">Modifica Pneumatico</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli Pneumatico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Modello</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Misura</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stagione</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleziona stagione</option>
                  <option value="summer">Estiva</option>
                  <option value="winter">Invernale</option>
                  <option value="all_season">4 Stagioni</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Battistrada (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tread_depth}
                  onChange={(e) => setFormData({ ...formData, tread_depth: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condizione</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleziona condizione</option>
                  <option value="excellent">Eccellente</option>
                  <option value="good">Buona</option>
                  <option value="fair">Discreta</option>
                  <option value="poor">Scarsa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Posizione</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleziona posizione</option>
                  <option value="anteriore_destro">Anteriore Destro</option>
                  <option value="anteriore_sinistro">Anteriore Sinistro</option>
                  <option value="posteriore_destro">Posteriore Destro</option>
                  <option value="posteriore_sinistro">Posteriore Sinistro</option>
                  <option value="scorta">Scorta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleziona status</option>
                  <option value="stored">In Deposito</option>
                  <option value="in_use">Montato</option>
                  <option value="scrapped">Smaltito</option>
                  <option value="sold">Venduto</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salva Modifiche"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
