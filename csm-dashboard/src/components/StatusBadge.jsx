export default function StatusBadge({ status, size = 'medium' }) {
  const getStatusClass = (status) => {
    const statusMap = {
      sent: 'badge-blue',
      opened: 'badge-purple',
      logged_in: 'badge-purple',
      in_progress: 'badge-yellow',
      completed: 'badge-green',
      draft: 'badge-gray',
      in_review: 'badge-blue',
      approved: 'badge-green',
      rejected: 'badge-red'
    };
    return statusMap[status] || 'badge-gray';
  };

  const sizeClass = size === 'small' ? 'badge-small' : '';

  return (
    <span className={`badge ${getStatusClass(status)} ${sizeClass}`}>
      {status ? status.replace(/_/g, ' ') : 'N/A'}
    </span>
  );
}
