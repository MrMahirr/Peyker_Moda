import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateSupplierDto, UpdateSupplierDto } from '../suppliers.service';
import { Supplier } from '../types';
import { Button } from '@/components/ui/Button';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateSupplierDto | UpdateSupplierDto) => Promise<void>;
    supplier?: Supplier | null;
}

export const SupplierModal = ({ isOpen, onClose, onSave, supplier }: SupplierModalProps) => {
    const [formData, setFormData] = useState<CreateSupplierDto>({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: '',
        taxOffice: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                contactName: supplier.contactName || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                taxNumber: supplier.taxNumber || '',
                taxOffice: supplier.taxOffice || '',
                isActive: supplier.isActive,
            });
        } else {
            setFormData({
                name: '',
                contactName: '',
                email: '',
                phone: '',
                address: '',
                taxNumber: '',
                taxOffice: '',
                isActive: true,
            });
        }
    }, [supplier, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save supplier", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-bold text-zinc-900">
                        {supplier ? 'Tedarikçiyi Düzenle' : 'Yeni Tedarikçi Ekle'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form id="supplier-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Firma / Kişi Adı *</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                    placeholder="Firma Adı"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Yetkili Kişi</label>
                                <input 
                                    type="text" 
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                    placeholder="Ad Soyad"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">E-posta</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                    placeholder="ornek@firma.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Telefon</label>
                                <input 
                                    type="text" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                    placeholder="+90 555 000 0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Vergi Numarası</label>
                                <input 
                                    type="text" 
                                    value={formData.taxNumber}
                                    onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                    placeholder="1234567890"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700">Vergi Dairesi</label>
                                <input 
                                    type="text" 
                                    value={formData.taxOffice}
                                    onChange={(e) => setFormData({...formData, taxOffice: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                                    placeholder="Beyoğlu VD"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-700">Adres</label>
                            <textarea 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm resize-none"
                                rows={3}
                                placeholder="Açık Adres"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="isActive" 
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 cursor-pointer">
                                Tedarikçi Aktif
                            </label>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={loading}>İptal</Button>
                    <Button type="submit" form="supplier-form" loading={loading} className="px-8">
                        {supplier ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
