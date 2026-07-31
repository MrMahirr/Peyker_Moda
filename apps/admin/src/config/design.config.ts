/**
 * Peyker Moda Admin — Merkezi Tasarım Token'ları
 * 
 * Tüm UI sabitleri (renk, font, bileşen stilleri) bu dosyada tanımlanır.
 * SOLID (SRP): Tasarım kararları tek dosyada izole edilmiştir.
 * Değişiklik yapmak için sadece bu dosyaya dokunmanız yeterlidir.
 */
export const designTokens = {
    fonts: {
        sans: "'Inter', system-ui, -apple-system, sans-serif",
    },

    colors: {
        primary: '#18181b',       // zinc-900
        primaryLight: '#f4f4f5',  // zinc-100
        primaryDark: '#09090b',   // zinc-950
        surface: '#ffffff',
        background: '#fafafa',
        heading: 'text-zinc-900',
        subtitle: 'text-zinc-500',
        muted: 'text-zinc-400',
    },

    /** Sayfa başlık stilleri — PageHeader bileşeni tarafından kullanılır */
    pageHeader: {
        title: 'text-2xl font-black tracking-tight text-zinc-900',
        subtitle: 'text-[13px] font-medium text-zinc-500 mt-1',
        wrapper: 'flex flex-col sm:flex-row sm:items-end justify-between gap-4',
    },

    /** Kart stilleri */
    card: {
        base: 'bg-white border border-zinc-100 rounded-xl shadow-sm',
        hover: 'hover:shadow-md transition-shadow',
        padding: 'p-6',
    },

    /** Buton stilleri */
    button: {
        primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
        secondary: 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50',
    },

    /** Tablo stilleri */
    table: {
        header: 'text-[11px] font-semibold uppercase tracking-wider text-zinc-400',
        cell: 'text-sm text-zinc-700',
        row: 'border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors',
    },

    /** Badge/Tag stilleri */
    badge: {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    },
} as const;

export type DesignTokens = typeof designTokens;
