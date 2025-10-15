import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Package, CreditCard, Truck, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent"
            >
              Your Local Shop
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-purple-200 hover:bg-purple-50 bg-transparent">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-purple-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
                Your Local Shop
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed text-pretty">
              Your Neighbourhood Store, Now Online! We offer both daily essentials and specialty items not found in
              supermarkets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-emerald-200 hover:bg-emerald-50 transition-all duration-200 bg-transparent"
              >
                Browse Catalogue
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <img src="/storefront.png" alt="Your Local Shop" className="rounded-2xl shadow-2xl" />
            </div>  
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">About Your Local Shop</h2>
          <p className="text-lg text-gray-600 leading-relaxed text-pretty">
            Your Local Shop is a Hawthorn convenience store bringing its unique range of daily essentials and specialty
            products online. Browse, order, and have items delivered city-wide. We combine the warmth and personal touch
            of your neighbourhood store with the convenience of modern e-commerce.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">What We Offer</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Browse Catalogue</CardTitle>
                <CardDescription>
                  Explore our wide range of daily essentials and specialty items not found in regular supermarkets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Manage Shopping Cart</CardTitle>
                <CardDescription>
                  Add items to your cart, adjust quantities, and checkout with ease using our intuitive interface.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Shop with confidence using our secure payment system that protects your financial information.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Fast Delivery</CardTitle>
                <CardDescription>
                  Get your orders delivered quickly across the city with our reliable delivery service.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Sales Reports</CardTitle>
                <CardDescription>
                  Admin users can access detailed sales analytics and reports to track business performance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Local & Fresh</CardTitle>
                <CardDescription>
                  Support your local community while enjoying fresh products and personalized service.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 bg-white border-t border-purple-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">© 2025 Your Local Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
