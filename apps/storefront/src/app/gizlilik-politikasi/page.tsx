import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function GizlilikPolitikasiPage() {
    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />
            <main className="container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-6">Gizlilik Politikası (KVKK)</h1>
                    <div className="prose prose-stone max-w-none text-stone-600">
                        <p className="mb-4">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                        <p className="mb-4">
                            Kişisel verilerinizin güvenliği ve gizliliği Peyker Moda için son derece önemlidir. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca hazırlanmıştır.
                        </p>
                        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">1. Toplanan Veriler</h2>
                        <p className="mb-4">
                            Sitemize kayıt olduğunuzda, sipariş verdiğinizde veya bültenimize abone olduğunuzda ad, soyad, e-posta adresi, telefon numarası ve adres gibi kişisel verileriniz toplanabilir.
                        </p>
                        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">2. Verilerin Kullanım Amacı</h2>
                        <p className="mb-4">
                            Toplanan verileriniz siparişlerinizin işlenmesi, teslimatı, müşteri hizmetleri desteği sağlanması ve size özel kampanyaların duyurulması amacıyla kullanılmaktadır.
                        </p>
                        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">3. Veri Paylaşımı</h2>
                        <p className="mb-4">
                            Kişisel verileriniz, yalnızca siparişlerinizin teslimatı için kargo şirketleri ve ödeme işlemleri için ödeme altyapısı sağlayıcıları ile paylaşılmaktadır.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
