export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Dimenticata</h1>
        <p className="text-gray-600 mb-4">Contatta l'amministratore per reimpostare la password.</p>
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Torna al login
        </a>
      </div>
    </div>
  )
}
