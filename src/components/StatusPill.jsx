export const StatusPill = ({ status }) => {
  const statusConfig = {
    'not-started': { label: 'Not Started', className: 'status-not-started' },
    'in-progress': { label: 'In Progress', className: 'status-in-progress' },
    'posted': { label: 'Posted', className: 'status-posted' },
    'correct': { label: 'Correct', className: 'status-correct' },
    'incorrect': { label: 'Incorrect', className: 'status-incorrect' }
  };
  const config = statusConfig[status] || statusConfig['not-started'];
  return <span className={`status-pill ${config.className}`}>{config.label}</span>;
};
