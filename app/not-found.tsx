import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <img src="/images/alev-logo.png" alt="Alev Digital" className="h-16" />
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8 text-center max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/">
        <Button className="bg-[#c1ff00] hover:bg-[#a8e600] text-black font-bold">Return to Challenge</Button>
      </Link>
    </div>
  )
}
