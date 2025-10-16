"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Pencil, Trash2, GripVertical, CheckCircle2, Package } from "lucide-react"
import { motion } from "framer-motion"

export interface Product {
  id: number
  name: string
  price: number
  category: string
  quantity?: number // Optional quantity from inventory
  inventoryId?: number // Optional inventory ID for updates
}

interface ProductListProps {
  products: Product[]
  loading: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  deletingProductId: number | null
  catalogueProductIds: number[] // Track which products are in catalogue by ID
}

function DraggableProductCard({
  product,
  onEdit,
  onDelete,
  isDeleting,
  isInCatalogue,
}: {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  isDeleting: boolean
  isInCatalogue: boolean // Pass as prop instead of reading from product
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `product-${product.id}`,
    data: product,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) ${isDragging ? "rotate(3deg) scale(1.05)" : ""}`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : "auto",
      }
    : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${isDragging ? "cursor-grabbing" : ""}`}
    >
      <Card
        className={`shadow-lg hover:shadow-xl transition-all duration-300 border-purple-100 ${
          isDragging ? "ring-2 ring-purple-400" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-purple-600 transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                {isInCatalogue && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                  {product.category}
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Quantity: {product.quantity !== undefined ? product.quantity : "Not set"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onEdit(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Spinner className="h-3 w-3 mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ProductList({
  products,
  loading,
  onEdit,
  onDelete,
  deletingProductId,
  catalogueProductIds,
}: ProductListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "product-list",
  })

  if (loading) {
    return (
      <Card className="shadow-xl border-purple-100">
        <CardContent className="p-6">
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card className="shadow-xl border-purple-100">
        <CardContent className="p-6">
          <p className="text-center text-gray-500 py-12">No products yet. Add your first product!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      className={`shadow-xl transition-all duration-300 ${
        isOver ? "border-purple-500 border-2 bg-purple-50/50 ring-4 ring-purple-200" : "border-purple-100"
      }`}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">All Products ({products.length})</h3>
        {isOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 border-2 border-dashed border-purple-400 rounded-lg bg-purple-50 text-center"
          >
            <p className="text-purple-700 font-semibold text-sm">Drop here to remove from catalogue</p>
          </motion.div>
        )}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {products.map((product) => (
            <DraggableProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingProductId === product.id}
              isInCatalogue={catalogueProductIds.includes(product.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
