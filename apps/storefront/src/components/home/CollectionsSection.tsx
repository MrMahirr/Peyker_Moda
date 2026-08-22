"use client";

import { CollectionsGrid } from "./collections/CollectionsGrid";
import { CollectionsHeader } from "./collections/CollectionsHeader";
import { useHomeCollections } from "./collections/hooks/useHomeCollections";

export default function CollectionsSection() {
  const { collections } = useHomeCollections();

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 md:px-8">
        <CollectionsHeader />
        <CollectionsGrid collections={collections} />
      </div>
    </section>
  );
}
