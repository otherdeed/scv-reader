export const formatDate = (date: Date | string) => {
  const dateObject = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-EN', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObject)
}