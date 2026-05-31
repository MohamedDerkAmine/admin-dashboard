function escape(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => unknown;
};

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((col) => escape(col.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((col) => escape(col.accessor(row))).join(","),
  );
  return [headerLine, ...dataLines].join("\r\n");
}

export function downloadCsv(filename: string, content: string) {
  if (typeof window === "undefined") {
    return;
  }
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
) {
  downloadCsv(filename, toCsv(rows, columns));
}
