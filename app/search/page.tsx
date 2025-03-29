import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { SearchHeader } from "@/components/search-header"
import { SearchResults } from "@/components/search-results"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function SearchPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <div className="bg-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">Productos</h1>
      </div>

      <SearchHeader />

      <div className="container max-w-md mx-auto p-4">
        <SearchResults />
      </div>

      <BottomNavigation />
    </main>
  )
}

