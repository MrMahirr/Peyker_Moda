export const formatCurrency = (amount: number, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('tr-TR').format(new Date(date));
};
