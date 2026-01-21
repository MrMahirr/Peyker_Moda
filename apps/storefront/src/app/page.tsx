import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import ProductSection from "@/components/home/ProductSection";
import { featuredProducts, saleProducts } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-200">
      <Header />

      <main>
        <HeroSection />

        <CategoriesSection />

        <ProductSection
          title="Öne Çıkan Parçalar"
          subtitle="Bu sezonun en çok tercih edilen ikonik tasarımları."
          products={featuredProducts}
          bgColor="bg-stone-50/50"
        />

        <ProductSection
          title="Sezon İndirimleri"
          subtitle="Favori parçalarınızda kaçırılmayacak fırsatlar."
          products={saleProducts}
          isSale={true}
        />
      </main>

      <Footer />
    </div>
  );
}
