import { useEffect, useState } from 'react';
import { getTableColumns } from '@/lib/database';

export interface UseTableDataConfig<T> {
  fetchData: () => Promise<T[]>;
  tableName: string;
  errorMessage: string;
  refreshTrigger?: number;
}

export function useTableData<T>({ fetchData, tableName, errorMessage, refreshTrigger }: UseTableDataConfig<T>) {
  const [data, setData] = useState<T[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedData, columnNames] = await Promise.all([
          fetchData(),
          getTableColumns(tableName)
        ]);
        setData(fetchedData);
        setColumns(columnNames);
      } catch (err) {
        setError(err instanceof Error ? err.message : errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchData, tableName, errorMessage, refreshTrigger]);

  return { data, columns, loading, error };
}