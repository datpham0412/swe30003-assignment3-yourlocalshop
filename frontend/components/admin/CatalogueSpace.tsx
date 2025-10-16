"use client"

import { useDroppable, useDraggable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ShoppingBag, CheckCircle2, GripVertical } from "lucide-react"
import { motion } from "framer-motion"
import type { Product } from "./ProductList"

interface CatalogueSpaceProps {
  catalogueProducts: Product[]
  isOver?: boolean
  loading?: boolean
}

function DraggableCatalogueProduct({ product, index }: { product: Product; index: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `catalogue-${product.id}`,
    data: product,
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={isDragging ? "opacity-50" : ""}
    >
      <Card className="shadow-md border-emerald-100 bg-emerald-50/30 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                    {product.category}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">${product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function CatalogueSpace({ catalogueProducts, loading }: CatalogueSpaceProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "catalogue-space",
  })

  return (
    <Card
      ref={setNodeRef}
      className={`shadow-xl transition-all duration-300 ${
        isOver
          ? "border-emerald-500 border-2 bg-emerald-50/50 ring-4 ring-emerald-200"
          : "border-emerald-100 border-dashed border-2"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Catalogue Space ({catalogueProducts.length} items)</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8 text-emerald-600" />
          </div>
        ) : (
          <div className="min-h-[400px]">
            {isOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center py-16 border-2 border-dashed border-emerald-400 rounded-lg bg-emerald-50"
              >
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-700 font-semibold">Drop here to add to catalogue</p>
                </div>
              </motion.div>
            )}

            {!isOver && catalogueProducts.length === 0 && (
              <div className="flex items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Drag products here to add to catalogue</p>
                  <p className="text-sm text-gray-400 mt-1">Products will be visible to customers</p>
                </div>
              </div>
            )}

            {!isOver && catalogueProducts.length > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {catalogueProducts.map((product, index) => (
                  <DraggableCatalogueProduct key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Drag products from the left into this space to make them visible in the customer
            catalogue. Drag them out to remove them.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
