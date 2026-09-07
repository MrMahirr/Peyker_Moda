// Termal yazıcıdaki fiziksel etiket: 45mm x 58mm (dikey/portrait), rulo üzerinde etiketler arası 4mm boşluk.
// @page boyutu bu yüzden 45mm x 62mm olarak tanımlanır; alttaki 4mm basılmayan (etiketler arası) boşluktur.
// Bu değer değişirse hem tek hem toplu yazdırma otomatik olarak güncellenir.
export const LABEL_WIDTH_MM = 45;
export const LABEL_HEIGHT_MM = 58;
export const LABEL_GAP_MM = 4;

export interface PrintLabelItem {
    barcode: string;
    productName: string;
    variantName?: string;
    price?: number;
    currency?: string;
}

export const formatLabelPrice = (value: number, currency = 'TRY') =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(value);

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export const LABEL_PRINT_STYLES = `
    @page { size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM + LABEL_GAP_MM}mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
        margin: 0;
        padding: 0;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }
    /* Yatay padding kasıtlı olarak dikeyden geniş: gerçek termal yazıcının
       basılabilir genişliği, tanımlı 45mm etiket genişliğinden birkaç mm dar
       kalabiliyor (kafa hizalaması/sensör payı) — içerik tam kenara dayanınca
       sağdan/soldan taşıyordu. Bu boşluk güvenlik payı sağlıyor. */
    .label {
        width: ${LABEL_WIDTH_MM}mm;
        height: ${LABEL_HEIGHT_MM}mm;
        margin-bottom: ${LABEL_GAP_MM}mm;
        padding: 1.6mm 2.6mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        overflow: hidden;
        page-break-after: always;
        break-after: page;
    }
    .label:last-child {
        page-break-after: auto;
        break-after: auto;
        margin-bottom: 0;
    }
    .store-name {
        font-size: 2.6mm;
        font-weight: 800;
        letter-spacing: 0.3mm;
        text-transform: uppercase;
        color: #000;
        margin-bottom: 0.6mm;
    }
    /* Ürün ismi ve beden termal baskıda silik çıkıyordu: küçük punto + ince harf
       gövdesi, kenarlardaki anti-alias gri pikselleri termal kafanın toplam
       koyuluğunu düşürüyordu. font-weight 900 + text-stroke ile gövdeyi
       kalınlaştırıp gri kenar oranını azaltıyoruz. */
    .product-name {
        width: 100%;
        text-align: center;
        font-size: 3.4mm;
        font-weight: 900;
        line-height: 1.15;
        color: #000;
        margin-bottom: 0.8mm;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        -webkit-text-stroke: 0.25px currentColor;
    }
    .info-row {
        width: 100%;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 0.8mm;
    }
    .variant-size {
        font-size: 3mm;
        font-weight: 900;
        text-transform: uppercase;
        color: #000;
        -webkit-text-stroke: 0.25px currentColor;
    }
    .price {
        font-size: 3.6mm;
        font-weight: 800;
        color: #000;
    }
    .barcode-container {
        width: 100%;
        height: 20mm;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    .barcode-svg {
        max-width: 92%;
        max-height: 100%;
    }
`;

export function renderLabelHtml(item: PrintLabelItem): string {
    return `
        <div class="label">
            <div class="store-name">Peyker Moda</div>
            <div class="product-name">${escapeHtml(item.productName)}</div>
            <div class="info-row">
                <span class="variant-size">${item.variantName ? escapeHtml(item.variantName) : ''}</span>
                <span class="price">${item.price !== undefined ? formatLabelPrice(item.price, item.currency) : ''}</span>
            </div>
            <div class="barcode-container">
                <svg class="barcode-svg" data-barcode="${escapeHtml(item.barcode)}"></svg>
            </div>
        </div>
    `;
}

// Not: EAN13, tam 12-13 haneli sayısal girdi ve düşük çözünürlüklü termal
// kafalarda çok ince çubuklar gerektirdiğinden bazı termal yazıcılar/okuyucular
// tarafından reddediliyordu. CODE128 aynı barkod değerini (rakamları) kodlayabilir,
// uzunluk/checksum kısıtı yoktur ve termal yazıcılarda çok daha güvenilir okunur.
export const BARCODE_RENDER_OPTIONS = {
    format: 'CODE128',
    width: 1.15,
    height: 60,
    displayValue: true,
    fontSize: 11,
    fontOptions: 'bold',
    font: 'Arial',
    margin: 0,
    textMargin: 2,
} as const;

export const JSBARCODE_CDN_URL = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
