# Yapilacaklar Listesi (Tasmalnmis)

Asagidaki liste, mevcut dokumanlara dayanarak cikartilan **yapilmamis / yapilacak** isleri icerir.
Tarihi kaynaklar farkli oldugu icin celiskili maddeler "Dogrilama gerekenler" altina ayrildi.

## Admin Panel
- [x] RoleManager.tsx API baglantisi
- [x] Magaza ayarlari API entegrasyonu (UI baglantisi)
- [x] Yazici ayarlari entegrasyonu
- [x] POS barkod okuyucu entegrasyonu
- [x] POS fis/yazici ciktilari
- [x] ReturnExchangeModal.tsx islevsellik
- [ ] Iade API endpoint entegrasyonu

## Storefront
- [ ] Kullanici girisi kontrolu (profil sayfasinda)
- [ ] Profil guncelleme API entegrasyonu
- [ ] Sepet backend hesaplama (storeApi.calculateCart)
- [ ] Kupon kodu dogrulama

## Backend (API)
- [ ] Uploads modulu (module/controller/service) + endpointler
- [ ] Returns modulu (module/controller/service) + endpointler
- [ ] Payments modulu (module/controller/service) + endpointler

## QA / Test
- [ ] Uctan uca test senaryosu: Urun ekle -> POS sepet -> odeme -> order -> stok dusumu -> fatura
- [ ] Tum admin ekranlari API response shape ile uyumlu mu kontrolu
- [ ] E2E testler (Playwright/Cypress)

## DevOps / Deployment
- [ ] HTTPS yapilandirmasi (production)
- [ ] Redis cache entegrasyonu (opsiyonel)
- [ ] Docker Compose production yapilandirmasi
- [ ] .env.production guvenlik yapilandirmasi
- [ ] CI/CD pipeline kurulumu (GitHub Actions)
- [ ] Veritabani backup stratejisi
- [ ] Canliya alma (VPS/Cloud)
- [ ] Domain ve SSL sertifikasi yapilandirmasi
- [ ] Monitoring ve logging (PM2, Grafana, vb.)

## Mimari / Guvenlik Iyilestirmeleri
- [ ] Izin bazli RBAC (Role/Permission modeli ve guard)
- [ ] Audit Log modeli ve izleme
- [ ] Media modeli + upload validation (MIME/size/extension)
- [ ] CMS sayfalari (Banner, StaticPage, SEO ayarlari)
- [ ] HttpOnly cookie auth + CSRF korumasi
- [ ] Admin ErrorBoundary ekleme
- [ ] Admin loading skeletons
- [ ] Merkezi query cache (TanStack Query/SWR)
- [ ] Storefront session yonetimi (AuthProvider)
- [ ] SEO metadata + ISR/revalidate iyilestirmeleri

## Hijyen
- [ ] API root altindaki debug log/txt dosyalarini temizle veya gitignore'a al

## Dogrulama Gerekenler (Celiskili Kayitlar)
- [ ] Admin full backend entegrasyonu durumu (Admin dokumani vs Backend dokumani)
- [ ] POS satis kaydetme API entegrasyonu durumu (Backend dokumani vs Tamamlama analizi)
- [ ] Storefront auth tamamlama durumu (aynı belgede farkli durumlar)
- [ ] Prisma migrate/generate durumu (dokumanlar farkli)
