import initSqlJs, { SqlJsStatic, Database } from "sql.js";
import { createTables, insertSampleData } from "./table-definitions";

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export async function initializeDatabase() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }

  if (!db) {
    db = new SQL.Database();
    createTables(db);
    insertSampleData(db);
  }

  return db;
}

export async function executeQuery(
  query: string
): Promise<Record<string, unknown>[]> {
  // No restrictions - all SQL operations are allowed in this training environment

  const db = await initializeDatabase();

  try {
    const result = db.exec(query);

    // For SELECT queries, return the results
    if (result.length === 0) {
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`SQLエラー: ${error.message}`);
    }
    throw error;
  }
}

export async function getTableData<T>(
  tableName: string,
  orderBy: string = "id"
): Promise<T[]> {
  const result = await executeQuery(
    `SELECT * FROM ${tableName} ORDER BY ${orderBy}`
  );
  return result as unknown as T[];
}

export async function getTableColumns(tableName: string): Promise<string[]> {
  const result = await executeQuery(`PRAGMA table_info(${tableName})`);
  return result.map((row: Record<string, unknown>) => row.name as string);
}

export async function getAllTables(): Promise<string[]> {
  const result = await executeQuery(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );
  return result.map((row: Record<string, unknown>) => row.name as string);
}

