"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useFavorites } from "@/lib/FavoritesContext";
import { fadeInUp } from "@/lib/utils";

import { ProductImageArea } from "./product-card/ProductImageArea";
import { ProductInfo } from "./product-card/ProductInfo";
import { ProductCardProps } from "./product-card/types";
import { useProductVariantPicker } from "./product-card/hooks/useProductVariantPicker";
import { VariantPickerModal } from "./product-card/VariantPickerModal";

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const picker = useProductVariantPicker({ product });

  const isSale = product.oldPrice !== null && product.oldPrice !== undefined;
  const productSlug = product.slug || `product-${product.id}`;
  const favorited = isFavorite(String(product.id));

  const handleToggleFavorite = async () => {
    await toggleFavorite(String(product.id), product.name);
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{ fadeInUp }}
      className="group relative"
    >
      <Link href={`/urun/${productSlug}`}>
        <ProductImageArea
          product={product}
          isSale={isSale}
          favorited={favorited}
          onFavoriteToggle={handleToggleFavorite}
          onAddToCart={picker.handleAddToCart}
        />
        <ProductInfo product={product} isSale={isSale} />
      </Link>

      <AnimatePresence>
        {picker.isPickerOpen && (
          <VariantPickerModal
            product={product}
            selectedSize={picker.selectedSize}
            selectedColor={picker.selectedColor}
            quantity={picker.quantity}
            availableSizes={picker.availableSizes}
            availableColors={picker.availableColors}
            currentPrice={picker.currentPrice}
            currentStock={picker.currentStock}
            canAddToCart={picker.canAddToCart}
            onClose={picker.closeVariantPicker}
            onSizeSelect={picker.setSelectedSize}
            onColorSelect={picker.setSelectedColor}
            isSizeAvailable={picker.isSizeAvailable}
            isColorAvailable={picker.isColorAvailable}
            onDecreaseQuantity={picker.decreaseQuantity}
            onIncreaseQuantity={picker.increaseQuantity}
            onAddToCart={picker.addSelectedItemToCart}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
