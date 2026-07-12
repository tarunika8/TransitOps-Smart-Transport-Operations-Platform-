import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination.jsx';
import EmptyState from './EmptyState.jsx';
import { cx } from '../utils/format.js';

/**
 * Generic sortable, paginated data table.
 *
 * columns: [{ key, label, render?, sortable?, className?, align? }]
 */
export default function DataTable({ columns, rows, pageSize = 8, emptyTitle, emptyDescription, initialSort }) {
  const [sort, setSort] = useState(initialSort || { key: null, dir: 'asc' });
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sort.key], vb = b[sort.key];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return sort.dir === 'asc' ? va - vb : vb - va;
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [rows, sort]);

  const paged = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize]
  );

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cx('th', c.align === 'right' && 'text-right', c.className)}>
                  {c.sortable ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-slate-800">
                      {c.label}
                      {sort.key !== c.key && <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />}
                      {sort.key === c.key && sort.dir === 'asc' && <ChevronUp className="w-3.5 h-3.5" />}
                      {sort.key === c.key && sort.dir === 'desc' && <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((row, i) => (
              <tr key={row.id || i} className="row-hover">
                {columns.map((c) => (
                  <td key={c.key} className={cx('td', c.align === 'right' && 'text-right', c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}
      {rows.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={sorted.length} onChange={setPage} />
      )}
    </div>
  );
}
