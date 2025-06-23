export interface QueryExecutionResult {
  success: boolean;
  results?: Record<string, unknown>[];
  error?: string;
  executionTime?: number;
  recordCount?: number;
  queryType?:
    | "SELECT"
    | "INSERT"
    | "UPDATE"
    | "DELETE"
    | "CREATE"
    | "DROP"
    | "TRUNCATE"
    | "OTHER";
  createdTableName?: string;
  droppedTableName?: string;
}

export function handleQueryExecuted(
  executionResult: QueryExecutionResult,
  setQueryExecution: (result: QueryExecutionResult | null) => void,
  setHasQueryResults: (value: boolean) => void,
  setActiveTab: (tab: string) => void,
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>
) {
  setQueryExecution(executionResult);
  setHasQueryResults(true);

  // Handle CREATE TABLE operations
  if (
    executionResult.success &&
    executionResult.queryType === "CREATE" &&
    executionResult.createdTableName
  ) {
    const tableName = executionResult.createdTableName;
    // Switch to the newly created table tab
    setActiveTab(tableName);
    setRefreshTrigger((prev) => prev + 1);
  }
  // If it's other data modification operations, trigger table refresh
  else if (
    executionResult.success &&
    executionResult.queryType &&
    ["INSERT", "UPDATE", "DELETE", "TRUNCATE"].includes(
      executionResult.queryType
    )
  ) {
    setRefreshTrigger((prev) => prev + 1);
  } else if (
    executionResult.success &&
    executionResult.queryType === "DROP" &&
    executionResult.droppedTableName
  ) {
    // Refresh all tables
    setRefreshTrigger((prev) => prev + 1);
  } else if (executionResult.success && executionResult.results) {
    // For SELECT queries, show results tab
    setActiveTab("query-results");
  }
}