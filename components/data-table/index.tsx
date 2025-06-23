'use client';

import React, { ReactNode } from 'react';
import { CommonTable } from '@/components/common-table';
import { useTableData, UseTableDataConfig } from '@/hooks/use-table-data';
import { defaultFormatValue } from '@/lib/format-utils';

export interface DataTableProps<T> extends UseTableDataConfig<T> {
  formatValue?: (value: unknown, column: string) => ReactNode;
  getRowKey?: (row: Record<string, unknown>, index: number) => string | number;
  getCellClassName?: (column: string) => string;
  getHeaderClassName?: (column: string) => string;
  customErrorDisplay?: (error: string) => ReactNode;
}

export function DataTable<T>({
  fetchData,
  tableName,
  errorMessage,
  formatValue = defaultFormatValue,
  getRowKey,
  getCellClassName,
  getHeaderClassName,
  customErrorDisplay,
  refreshTrigger,
}: DataTableProps<T>) {
  const { data, columns, loading, error } = useTableData({
    fetchData,
    tableName,
    errorMessage,
    refreshTrigger,
  });

  // Use custom error display if provided
  if (error && customErrorDisplay) {
    return <>{customErrorDisplay(error)}</>;
  }

  return (
    <CommonTable
      data={data as unknown as Record<string, unknown>[]}
      columns={columns}
      loading={loading}
      error={error}
      formatValue={formatValue}
      getRowKey={getRowKey}
      getCellClassName={getCellClassName}
      getHeaderClassName={getHeaderClassName}
    />
  );
}