'use client';

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CommonTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  loading: boolean;
  error: string | null;
  formatValue?: (value: unknown, column: string) => ReactNode;
  getRowKey?: (row: Record<string, unknown>, index: number) => string | number;
  getCellClassName?: (column: string) => string;
  getHeaderClassName?: (column: string) => string;
}

export function CommonTable({
  data,
  columns,
  loading,
  error,
  formatValue = defaultFormatValue,
  getRowKey = defaultGetRowKey,
  getCellClassName = defaultGetCellClassName,
  getHeaderClassName = defaultGetHeaderClassName,
}: CommonTableProps) {
  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-destructive">エラー: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead 
              key={column} 
              className={getHeaderClassName(column)}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
              データがありません
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={getRowKey(row, index)}>
              {columns.map((column) => (
                <TableCell 
                  key={column}
                  className={getCellClassName(column)}
                >
                  {formatValue(row[column], column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// Default implementations
function defaultFormatValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return '-';
  return String(value);
}

function defaultGetRowKey(row: Record<string, unknown>, index: number): string | number {
  return (row.id as string | number) || index;
}

function defaultGetCellClassName(column: string): string {
  if (column === 'id') return 'font-medium';
  if (column === 'salary' || column === 'budget') return 'text-right';
  return '';
}

function defaultGetHeaderClassName(column: string): string {
  if (column === 'id') return 'w-[100px]';
  if (column === 'salary' || column === 'budget') return 'text-right';
  return '';
}