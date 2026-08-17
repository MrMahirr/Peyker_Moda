import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const swal = MySwal.mixin({
    customClass: {
        popup: 'rounded-xl shadow-xl border border-zinc-100',
        title: 'text-zinc-900 font-bold',
        htmlContainer: 'text-zinc-500',
        confirmButton: 'bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all mx-2',
        cancelButton: 'bg-zinc-100 text-zinc-600 font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 focus:ring-4 focus:ring-zinc-100 transition-all mx-2'
    },
    buttonsStyling: false,
    confirmButtonText: 'Evet, Onayla',
    cancelButtonText: 'İptal',
});

export const showDeleteConfirm = (title = 'Emin misiniz?', text = 'Bu işlem geri alınamaz!') => {
    return swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'Vazgeç',
        customClass: {
            confirmButton: 'bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all mx-2',
            cancelButton: 'bg-zinc-100 text-zinc-600 font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 focus:ring-4 focus:ring-zinc-100 transition-all mx-2',
            popup: 'rounded-xl shadow-xl'
        }
    });
};

export const showSuccess = (title: string, text: string) => {
    return swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonText: 'Tamam',
        customClass: {
            confirmButton: 'bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all mx-2',
            popup: 'rounded-xl shadow-xl'
        }
    });
};

export const showError = (title: string, text: string) => {
    return swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonText: 'Tamam',
        customClass: {
            confirmButton: 'bg-red-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all mx-2',
            popup: 'rounded-xl shadow-xl'
        }
    });
};
