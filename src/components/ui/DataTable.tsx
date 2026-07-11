import { type ReactNode, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: 'right' | 'left' | 'center';
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  pageSize?: number;
  emptyState?: ReactNode;
  dense?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  selectable = false,
  selectedIds,
  onSelectionChange,
  pageSize = 15,
  emptyState,
  dense = false,
}: Props<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const sorted = [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const allSelected = selectable && pageData.length > 0 && pageData.every((r) => selectedIds?.has(rowKey(r)));
  const someSelected = selectable && pageData.some((r) => selectedIds?.has(rowKey(r))) && !allSelected;

  const toggleAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (allSelected) {
      pageData.forEach((r) => next.delete(rowKey(r)));
    } else {
      pageData.forEach((r) => next.add(rowKey(r)));
    }
    onSelectionChange(next);
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const alignClass = (a?: string) => (a === 'center' ? 'text-center' : a === 'left' ? 'text-left' : 'text-right');
  const cellPad = dense ? 'px-3 py-1.5' : 'px-4 py-2.5';

  if (data.length === 0 && emptyState) {
    return <div className="card">{emptyState}</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50 sticky top-0">
              {selectable && (
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected || false;
                    }}
                    onChange={toggleAll}
                    className="rounded border-ink-300 text-brand-600 focus:ring-brand-500/20"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${cellPad} ${alignClass(col.align)} text-xs font-semibold text-ink-600 ${col.sortable ? 'cursor-pointer select-none hover:text-ink-900' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    {col.sortable && sortKey !== col.key && <ArrowUpDown size={12} className="text-ink-300" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => {
              const id = rowKey(row);
              const selected = selectedIds?.has(id);
              return (
                <tr
                  key={id}
                  className={`border-b border-ink-100 table-row-hover ${onRowClick ? 'cursor-pointer' : ''} ${selected ? 'bg-brand-50/50' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected || false}
                        onChange={() => toggleRow(id)}
                        className="rounded border-ink-300 text-brand-600 focus:ring-brand-500/20"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`${cellPad} ${alignClass(col.align)} text-ink-700 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 h-12 border-t border-ink-200 bg-ink-50/50">
          <p className="text-xs text-ink-500">
            عرض {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} من {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button className="btn-ghost btn-icon btn-sm" disabled={page === 0} onClick={() => setPage(0)}>
              <ChevronsRight size={14} />
            </button>
            <button className="btn-ghost btn-icon btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronRight size={14} />
            </button>
            <span className="text-xs text-ink-600 px-2 tabular">
              {page + 1} / {totalPages}
            </span>
            <button className="btn-ghost btn-icon btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn-ghost btn-icon btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
              <ChevronsLeft size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
