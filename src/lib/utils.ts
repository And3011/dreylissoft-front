export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(Number(value || 0));
}

export function getErrorMessage(error: any) {
  return error?.response?.data?.message || error?.message || 'Error inesperado';
}
