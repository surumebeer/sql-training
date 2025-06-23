'use client';

import { TabsContent } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-table';
import { getTableData } from '@/lib/database';

interface TableTabContentProps {
  allTables: string[];
  refreshTrigger: number;
}

export function TableTabContent({ allTables, refreshTrigger }: TableTabContentProps) {
  return (
    <>
      {allTables.map((tableName) => (
        <TabsContent key={tableName} value={tableName} className="mt-6">
          <DataTable<Record<string, unknown>>
            key={`${tableName}-${refreshTrigger}`}
            fetchData={() => getTableData<Record<string, unknown>>(tableName, "rowid")}
            tableName={tableName}
            errorMessage="データの取得に失敗しました"
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
      ))}
    </>
  );
}