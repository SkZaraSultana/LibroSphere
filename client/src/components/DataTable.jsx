import React from 'react'

export default function DataTable({ columns, data, emptyMessage, loading }) {
  if (loading) {
    return (
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center text-[var(--color-text-2)]">
        Loading records...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center text-[var(--color-text-2)]">
        {emptyMessage || 'No records available.'}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-left">
          <thead className="bg-[var(--color-background)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-2)]">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id || item.id} className="border-t border-[var(--color-border)] last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-5 py-4 align-top text-sm text-[var(--color-text)]">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
