import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FavoritesContent from "@/components/profile/FavoritesContent";

export default function FavoritesPage() {
    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-24 md:py-32 flex-grow">
                <FavoritesContent />
            </main>
            <Footer />
        </div>
    );
}
