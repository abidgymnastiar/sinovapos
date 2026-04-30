import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReportColumn, ReportRow } from "@/services/reportService";

type ReportTableProps = {
  columns: ReportColumn[];
  data: ReportRow[];
};

function getCellValue(row: ReportRow, column: ReportColumn) {
  const value = row[column.key];

  return value === undefined || value === null || value === "" ? "-" : value;
}

export function ReportTable({ columns, data }: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table className="min-w-max">
        <TableHeader className="bg-muted">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-14 px-5 text-center text-base font-semibold",
                  column.key === "nama_produk" &&
                    "sticky left-0 z-20 min-w-60 bg-muted text-left",
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.product_id}>
                {columns.map((column) => (
                  <TableCell
                    key={`${row.product_id}-${column.key}`}
                    className={cn(
                      "h-16 px-5 text-center text-base",
                      column.key === "nama_produk" &&
                        "sticky left-0 z-10 min-w-60 bg-background text-left font-medium",
                    )}
                  >
                    {getCellValue(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Belum ada data laporan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
