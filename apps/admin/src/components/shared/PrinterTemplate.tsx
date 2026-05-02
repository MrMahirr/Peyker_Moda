import React, { forwardRef } from 'react';

interface OrderItem {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    variant?: string;
}

interface PrinterTemplateProps {
    orderNumber: string;
    date: string;
    cashier?: string;
    customer?: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod?: string;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

/**
 * POS Termal Yazıcı Fiş Şablonu
 * forwardRef ile dışarıdan print ref'i alarak react-to-print gibi kütüphanelerle uyumlu çalışır.
 */
export const PrinterTemplate = forwardRef<HTMLDivElement, PrinterTemplateProps>(
    (
        {
            orderNumber,
            date,
            cashier,
            customer,
            items,
            subtotal,
            discount,
            total,
            paymentMethod,
            storeName = 'Peyker Moda',
            storeAddress,
            storePhone,
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                style={{
                    width: '80mm',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '8px',
                    color: '#000',
                    backgroundColor: '#fff',
                }}
            >
                {/* --- HEADER --- */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{storeName}</div>
                    {storeAddress && <div style={{ fontSize: '10px' }}>{storeAddress}</div>}
                    {storePhone && <div style={{ fontSize: '10px' }}>Tel: {storePhone}</div>}
                </div>

                <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

                {/* --- ORDER INFO --- */}
                <div style={{ marginBottom: '4px' }}>
                    <div>Fiş No: <strong>{orderNumber}</strong></div>
                    <div>Tarih: {date}</div>
                    {cashier && <div>Kasiyer: {cashier}</div>}
                    {customer && <div>Müşteri: {customer}</div>}
                </div>

                <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

                {/* --- ITEMS TABLE --- */}
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Ürün</th>
                            <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Ad.</th>
                            <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{ paddingBottom: '2px' }}>
                                    {item.name}
                                    {item.variant && (
                                        <div style={{ fontSize: '9px', color: '#666' }}>
                                            {item.variant}
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                {/* --- TOTALS --- */}
                <div style={{ fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ara Toplam:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c00' }}>
                            <span>İndirim:</span>
                            <span>-{formatCurrency(discount)}</span>
                        </div>
                    )}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginTop: '4px',
                        }}
                    >
                        <span>TOPLAM:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>

                {paymentMethod && (
                    <div style={{ marginTop: '4px', fontSize: '11px' }}>
                        Ödeme: {paymentMethod}
                    </div>
                )}

                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                {/* --- FOOTER --- */}
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                    <div>Bizi tercih ettiğiniz için teşekkür ederiz.</div>
                    <div style={{ marginTop: '2px' }}>İade: 14 gün içinde fişle birlikte.</div>
                </div>
            </div>
        );
    }
);

PrinterTemplate.displayName = 'PrinterTemplate';
