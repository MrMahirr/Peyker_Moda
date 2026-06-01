import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function KullanimKosullariPage() {
    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
            <Header />
            <main className="container mx-auto px-4 py-24 md:py-32">
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-6">Kullanım Koşulları</h1>
                    <div className="prose prose-stone max-w-none text-stone-600">
                        <p className="mb-4">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                        <p className="mb-4">
                            Peyker Moda web sitesine hoş geldiniz. Bu web sitesini kullanarak aşağıdaki kullanım koşullarını kabul etmiş olursunuz.
                        </p>
                        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">1. Hizmet Kullanımı</h2>
                        <p className="mb-4">
                            Sitemizde sunulan hizmetler yalnızca kişisel ve ticari olmayan kullanım içindir. Site içeriğinin izinsiz kopyalanması, çoğaltılması veya dağıtılması kesinlikle yasaktır.
                        </p>
                        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">2. Ürün Bilgileri ve Fiyatlandırma</h2>
                        <p className="mb-4">
                            Peyker Moda, ürün açıklamaları ve fiyatlandırma konusunda olabildiğince doğru olmaya çalışır. Ancak, sitedeki bilgilerin her zaman hatasız, eksiksiz veya güncel olduğunu garanti etmez.
                        </p>
                        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">3. İade ve Değişim</h2>
                        <p className="mb-4">
                            Satın aldığınız ürünleri, teslimat tarihinden itibaren 14 gün içerisinde kullanılmamış ve etiketleri sökülmemiş olması şartıyla iade edebilir veya değiştirebilirsiniz.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
