const maintenance = [
  { id: 'M-501', vehicle: 'V-003', issue: 'Clutch overhaul',       type: 'Corrective',  status: 'In Progress', start: '2026-06-28', end: null },
  { id: 'M-502', vehicle: 'V-008', issue: '60,000 km service',     type: 'Preventive',  status: 'In Progress', start: '2026-07-02', end: null },
  { id: 'M-503', vehicle: 'V-002', issue: 'Brake pad replacement', type: 'Corrective',  status: 'Completed',   start: '2026-06-15', end: '2026-06-17' },
  { id: 'M-504', vehicle: 'V-005', issue: 'Tyre rotation',         type: 'Preventive',  status: 'Completed',   start: '2026-06-20', end: '2026-06-20' },
  { id: 'M-505', vehicle: 'V-011', issue: 'AC compressor',         type: 'Corrective',  status: 'Cancelled',   start: '2026-06-10', end: '2026-06-11' },
  { id: 'M-506', vehicle: 'V-006', issue: 'Oil & filter change',   type: 'Preventive',  status: 'Scheduled',   start: '2026-07-15', end: null },
];

export default maintenance;
