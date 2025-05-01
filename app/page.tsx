import { RucFinder } from "@/components/ruc-finder"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Sistema de Gestión de RUC</h1>
      <div className="max-w-md mx-auto">
        <RucFinder />
      </div>
    </main>
  )
}
