import { SearchResults } from "@/components/search-results"
import { SearchHeader } from "@/components/search-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background-light android-safe-top has-bottom-nav">
      <SearchHeader />
      <div className="container max-w-md mx-auto p-4">
        <SearchResults />
      </div>

      {/* Replace the fixed bottom indicator with the bottom navigation */}
      <BottomNavigation />

      {/* Add a floating action button for adding products */}
      <Link href="/add-product" className="fab">
        <Plus size={24} />
      </Link>
    </main>
  )
}

