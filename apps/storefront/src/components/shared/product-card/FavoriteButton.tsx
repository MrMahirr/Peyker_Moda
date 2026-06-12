import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  favorited: boolean;
  onToggle: () => void;
};

export function FavoriteButton({ favorited, onToggle }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 opacity-0 translate-y-2 backdrop-blur-sm transition-all duration-300 hover:text-rose-500 group-hover:translate-y-0 group-hover:opacity-100"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      aria-label="Favorilere ekle"
    >
      <Heart
        className={`h-5 w-5 ${favorited ? "fill-rose-500 text-rose-500" : ""}`}
      />
    </button>
  );
}
