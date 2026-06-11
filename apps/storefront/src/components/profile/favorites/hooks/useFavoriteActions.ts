import Swal from "sweetalert2";
import { useCart } from "@/lib/CartContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { FavoriteItem } from "../types";

interface UseFavoriteActionsOptions {
  onRemoved?: (id: string) => void;
}

export function useFavoriteActions({
  onRemoved,
}: UseFavoriteActionsOptions = {}) {
  const { addItem } = useCart();
  const { toggleFavorite } = useFavorites();

  const addToCart = (item: FavoriteItem) => {
    addItem({
      id: item.id,
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  const removeFavorite = async (item: FavoriteItem) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: `${item.name} favorilerden silinecek!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Iptal",
    });

    if (!result.isConfirmed) return;

    await toggleFavorite(item.id, item.name);
    onRemoved?.(item.id);
  };

  return {
    addToCart,
    removeFavorite,
  };
}
