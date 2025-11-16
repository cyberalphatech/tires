export interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  created_at: Date
  updated_at: Date
}

export interface Vehicle {
  id: number
  customer_id: number
  license_plate: string
  make: string
  model: string
  year: number
  vin?: string
  total_km: number
  fuel_type?: string
  color?: string
  images?: string[]
  created_at: Date
  updated_at: Date
}

export interface Tire {
  id: number
  vehicle_id: number
  customer_id: number
  tire_code: string
  brand: string
  size: string
  position: string
  season: "winter" | "summer"
  dot_code?: string
  year: number
  tread_depth: number
  condition: "excellent" | "good" | "fair" | "poor"
  purchase_price?: number
  storage_location?: string
  status: "active" | "stored" | "scrapped"
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface KmHistory {
  id: number
  vehicle_id: number
  km_reading: number
  date_recorded: Date
  notes?: string
  created_at: Date
}

export interface NotesHistory {
  id: number
  vehicle_id: number
  note: string
  created_at: Date
}

export interface ScrappedTire {
  id: number
  tire_id: number
  reason: string
  disposal_date: Date
  disposal_method?: string
  created_at: Date
}
