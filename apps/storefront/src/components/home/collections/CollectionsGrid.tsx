import { CollectionCard } from "./CollectionCard";
import { CollectionDisplay } from "./types";

type CollectionsGridProps = {
  collections: CollectionDisplay[];
};

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {collections.map((collection, index) => (
        <CollectionCard
          key={`${collection.slug || collection.name}-${index}`}
          collection={collection}
          index={index}
        />
      ))}
    </div>
  );
}
