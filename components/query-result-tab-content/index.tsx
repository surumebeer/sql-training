'use client';

import { TabsContent } from '@/components/ui/tabs';
import { QueryResultTable } from '@/components/query-result-table';
import { QueryExecutionResult } from '@/lib/query-execution';

interface QueryResultTabContentProps {
  hasQueryResults: boolean;
  queryExecution: QueryExecutionResult | null;
}

export function QueryResultTabContent({ hasQueryResults, queryExecution }: QueryResultTabContentProps) {
  if (!hasQueryResults) return null;

  return (
    <TabsContent value="query-results" className="mt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">クエリ実行結果</h3>
          {queryExecution?.executionTime && (
            <span className="text-sm text-muted-foreground">
              実行時間: {queryExecution.executionTime.toFixed(2)}ms
            </span>
          )}
        </div>

        {queryExecution?.success === false && queryExecution.error && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <h4 className="text-red-800 font-medium mb-2">エラー</h4>
            <p className="text-sm text-red-700">{queryExecution.error}</p>
          </div>
        )}

        {queryExecution?.success === true && (
          <>
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h4 className="text-green-800 font-medium mb-2">実行成功</h4>
              <p className="text-sm text-green-700">
                クエリが正常に実行されました。
                {queryExecution.recordCount || 0}件のレコードが見つかりました。
              </p>
            </div>

            {queryExecution.results && queryExecution.results.length > 0 && (
              <QueryResultTable results={queryExecution.results} />
            )}

            {queryExecution.results && queryExecution.results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                クエリは正常に実行されましたが、結果がありませんでした。
              </div>
            )}
          </>
        )}
      </div>
    </TabsContent>
  );
}