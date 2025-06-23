"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { SqlQueryInterface } from "@/components/sql-query-interface";
import { TableTabsList } from "@/components/table-tabs-list";
import { TableTabContent } from "@/components/table-tab-content";
import { QueryResultTabContent } from "@/components/query-result-tab-content";
import { useAllTables } from "@/hooks/use-all-tables";
import { handleQueryExecuted, QueryExecutionResult } from "@/lib/query-execution";

export default function Home() {
  const [activeTab, setActiveTab] = useState("employees");
  const [queryExecution, setQueryExecution] = useState<QueryExecutionResult | null>(null);
  const [hasQueryResults, setHasQueryResults] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { allTables, loading } = useAllTables(refreshTrigger, activeTab, setActiveTab);

  const onQueryExecuted = (executionResult: QueryExecutionResult) => {
    handleQueryExecuted(
      executionResult,
      setQueryExecution,
      setHasQueryResults,
      setActiveTab,
      setRefreshTrigger
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">SQL Training</h1>

      <div className="space-y-8">
        {/* Data Tables Section */}
        <div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TableTabsList allTables={allTables} hasQueryResults={hasQueryResults} />
            
            <TableTabContent allTables={allTables} refreshTrigger={refreshTrigger} />
            
            <QueryResultTabContent 
              hasQueryResults={hasQueryResults} 
              queryExecution={queryExecution} 
            />
          </Tabs>
        </div>

        {/* SQL Query Section */}
        <div>
          <SqlQueryInterface onQueryExecuted={onQueryExecuted} />
        </div>
      </div>
    </div>
  );
}
