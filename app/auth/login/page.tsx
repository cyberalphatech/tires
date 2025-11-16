"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Login page mounted")
    console.log("[v0] Checking if Card component renders with styles")
    
    // Check computed styles of key elements
    setTimeout(() => {
      const card = document.querySelector('.max-w-md')
      if (card) {
        const styles = window.getComputedStyle(card)
        console.log("[v0] Card element found")
        console.log("[v0] Card background:", styles.backgroundColor)
        console.log("[v0] Card border:", styles.border)
        console.log("[v0] Card padding:", styles.padding)
        console.log("[v0] Card border-radius:", styles.borderRadius)
      } else {
        console.log("[v0] ERROR: Card element not found!")
      }
      
      const button = document.querySelector('button[type="submit"]')
      if (button) {
        const btnStyles = window.getComputedStyle(button)
        console.log("[v0] Button background:", btnStyles.backgroundColor)
        console.log("[v0] Button color:", btnStyles.color)
      } else {
        console.log("[v0] ERROR: Button not found!")
      }
    }, 500)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/dashboard")
      } else {
        setError(data.error || "Errore durante il login")
      }
    } catch (error) {
      setError("Errore di connessione. Riprova più tardi.")
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl font-bold text-gray-900">Accedi</CardTitle>
          <CardDescription className="text-gray-600">
            Inserisci le tue credenziali per accedere al sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="bg-white">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@officina.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  Accesso in corso...
                </div>
              ) : (
                "Accedi"
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-800 font-medium">Credenziali di test:</p>
            <p className="text-xs text-gray-600">Email: admin@tirespro.com</p>
            <p className="text-xs text-gray-600">Password: admin123</p>
          </div>

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-gray-500">
              Non hai un account?{" "}
              <Link href="/auth/register" className="text-gray-700 hover:underline font-medium">
                Registrati qui
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
