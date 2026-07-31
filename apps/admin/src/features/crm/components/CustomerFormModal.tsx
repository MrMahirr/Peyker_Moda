import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { customersService, Customer, CreateCustomerDto } from '../api/customerService';
import { toast } from 'sonner';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerToEdit?: Customer | null;
    onSuccess: () => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, customerToEdit, onSuccess }) => {
    const [formData, setFormData] = useState<CreateCustomerDto>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customerToEdit) {
            setFormData({
                firstName: customerToEdit.firstName,
                lastName: customerToEdit.lastName,
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                address: customerToEdit.address || '',
                notes: customerToEdit.notes || '',
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                notes: '',
            });
        }
    }, [customerToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.phone) {
            toast.error('Lütfen zorunlu alanları doldurun (Ad, Soyad, Telefon)');
            return;
        }

        const submitData = { ...formData };
        if (submitData.email === '') submitData.email = undefined;

        setLoading(true);
        try {
            if (customerToEdit) {
                await customersService.update(customerToEdit.id, submitData);
                toast.success('Müşteri başarıyla güncellendi');
            } else {
                await customersService.create(submitData);
                toast.success('Yeni müşteri başarıyla eklendi');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Customer save error:', error);
            toast.error(error.response?.data?.message || 'Müşteri kaydedilirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={customerToEdit ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
            description="Müşterinin temel iletişim ve detay bilgilerini giriniz."
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Ad"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                    <Input
                        label="Soyad"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Telefon Numarası"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="+90 5XX XXX XX XX"
                    />
                    <Input
                        label="E-posta Adresi"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Örn: adres@email.com"
                    />
                </div>

                <Input
                    label="Adres"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Tam adres bilgisi"
                />

                <Input
                    label="Notlar"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Müşteri hakkında özel notlar..."
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                        İptal
                    </Button>
                    <Button type="submit" variant="primary" loading={loading}>
                        {customerToEdit ? 'Güncelle' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
