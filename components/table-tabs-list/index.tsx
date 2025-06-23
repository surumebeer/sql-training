'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TableTabsListProps {
  allTables: string[];
  hasQueryResults: boolean;
}

export function TableTabsList({ allTables, hasQueryResults }: TableTabsListProps) {
  return (
    <TabsList
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${
          allTables.length + (hasQueryResults ? 1 : 0)
        }, minmax(0, 1fr))`,
      }}
    >
      {allTables.map((tableName) => (
        <TabsTrigger key={tableName} value={tableName}>
          {tableName}
        </TabsTrigger>
      ))}
      {hasQueryResults && (
        <TabsTrigger value="query-results">実行結果</TabsTrigger>
      )}
    </TabsList>
  );
}