import { Modal } from '@/components/ui/Modal';
import { AddProductPage } from '../AddProductPage';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddProductModal = ({ isOpen, onClose, onSuccess }: AddProductModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" className="max-h-[90vh]">
            <div className="max-h-[80vh] overflow-y-auto pr-1">
                <AddProductPage onClose={onClose} onSuccess={onSuccess} isModal />
            </div>
        </Modal>
    );
};
