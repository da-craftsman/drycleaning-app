/** Escapes a single CSV field per RFC 4180 — wraps in quotes and doubles any embedded quotes whenever the value contains a comma, quote, or newline. */
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Builds a CSV string (with header row) from an array of row objects, in the given column order. */
export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: { key: keyof T; label: string }[]): string {
  const header = columns.map((c) => escapeCsvField(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(String(row[c.key] ?? ''))).join(','))
  return [header, ...lines].join('\r\n')
}

/** Triggers a browser download of the given CSV content. */
export function downloadCsv(filename: string, csv: string) {
  // Leading BOM so Excel opens the file as UTF-8 instead of guessing the system codepage.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
