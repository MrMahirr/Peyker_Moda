import React, { ReactNode } from 'react';
import { designTokens } from '@/config/design.config';

interface PageHeaderProps {
    /** Sayfa ana başlığı (h1) */
    title: string;
    /** Opsiyonel açıklama metni */
    subtitle?: string;
    /** Başlığın sağ tarafına yerleştirilecek aksiyonlar (butonlar vb.) */
    actions?: ReactNode;
}

/**
 * Tüm admin sayfalarında kullanılan standart sayfa başlığı.
 * Stil merkezi config'den (design.config.ts) beslenir.
 * 
 * @example
 * <PageHeader
 *   title="Genel Bakış"
 *   subtitle="Mağazanızın bugünkü performansı."
 *   actions={<Button>Rapor İndir</Button>}
 * />
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
    return (
        <div className={designTokens.pageHeader.wrapper}>
            <div>
                <h1 className={designTokens.pageHeader.title}>{title}</h1>
                {subtitle && (
                    <p className={designTokens.pageHeader.subtitle}>{subtitle}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
};
