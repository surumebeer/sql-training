"use client";

import { CommonTable } from "@/components/common-table";
import { defaultFormatValue } from "@/lib/format-utils";

interface QueryResultTableProps {
  results: Record<string, unknown>[];
}

export function QueryResultTable({ results }: QueryResultTableProps) {
  if (results.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">結果がありません</p>
    );
  }

  // Get column names from the first result
  const columns = Object.keys(results[0]);

  return (
    <div className="overflow-x-auto">
      <CommonTable
        data={results}
        columns={columns}
        loading={false}
        error={null}
        formatValue={defaultFormatValue}
        getHeaderClassName={() => "font-mono"}
        getCellClassName={() => "font-mono text-sm"}
      />
    </div>
  );
}
