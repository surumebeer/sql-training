'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { executeQuery } from '@/lib/database';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface QueryExecutionResult {
  success: boolean;
  results?: Record<string, unknown>[];
  error?: string;
  executionTime?: number;
  recordCount?: number;
  queryType?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'TRUNCATE' | 'OTHER';
  createdTableName?: string;
  droppedTableName?: string;
}

interface SqlQueryInterfaceProps {
  onQueryExecuted: (executionResult: QueryExecutionResult) => void;
}

export function SqlQueryInterface({ onQueryExecuted }: SqlQueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentQuery = query;
    
    const newQuery = currentQuery.substring(0, start) + text + currentQuery.substring(end);
    setQuery(newQuery);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const detectQueryType = (query: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'TRUNCATE' | 'OTHER' => {
    const trimmedQuery = query.trim().toUpperCase();
    if (trimmedQuery.startsWith('SELECT')) return 'SELECT';
    if (trimmedQuery.startsWith('INSERT')) return 'INSERT';
    if (trimmedQuery.startsWith('UPDATE')) return 'UPDATE';
    if (trimmedQuery.startsWith('DELETE')) return 'DELETE';
    if (trimmedQuery.startsWith('CREATE')) return 'CREATE';
    if (trimmedQuery.startsWith('DROP')) return 'DROP';
    if (trimmedQuery.startsWith('TRUNCATE')) return 'TRUNCATE';
    return 'OTHER';
  };

  const extractTableName = (query: string): string | null => {
    const trimmedQuery = query.trim().toUpperCase();
    if (trimmedQuery.startsWith('CREATE TABLE')) {
      // Match CREATE TABLE [IF NOT EXISTS] table_name
      const match = trimmedQuery.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/);
      return match ? match[1].toLowerCase() : null;
    }
    return null;
  };

  const extractDroppedTableName = (query: string): string | null => {
    const trimmedQuery = query.trim().toUpperCase();
    if (trimmedQuery.startsWith('DROP TABLE')) {
      // Match DROP TABLE [IF EXISTS] table_name
      const match = trimmedQuery.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([^\s;]+)/);
      return match ? match[1].toLowerCase() : null;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onQueryExecuted({
        success: false,
        error: 'SQLクエリを入力してください'
      });
      return;
    }

    setLoading(true);
    
    const startTime = performance.now();
    
    const queryType = detectQueryType(query);
    
    try {
      const data = await executeQuery(query);
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const createdTableName = queryType === 'CREATE' ? extractTableName(query) || undefined : undefined;
      const droppedTableName = queryType === 'DROP' ? extractDroppedTableName(query) || undefined : undefined;
      
      onQueryExecuted({
        success: true,
        results: data,
        executionTime,
        recordCount: data.length,
        queryType,
        createdTableName,
        droppedTableName
      });
    } catch (err) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      onQueryExecuted({
        success: false,
        error: err instanceof Error ? err.message : 'クエリの実行中にエラーが発生しました',
        executionTime,
        queryType
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    { 
      label: '基本SELECT', 
      query: 'SELECT * FROM employees LIMIT 5' 
    },
    { 
      label: '給与TOP5', 
      query: 'SELECT name, position, salary FROM employees ORDER BY salary DESC LIMIT 5' 
    },
    { 
      label: '部署別人数', 
      query: 'SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department ORDER BY employee_count DESC' 
    },
    { 
      label: '部署とマネージャー', 
      query: `SELECT d.name as department_name, e.name as manager_name, d.location, d.budget
FROM departments d
LEFT JOIN employees e ON d.manager_id = e.id
ORDER BY d.name` 
    },
    { 
      label: 'プロジェクトと部署', 
      query: `SELECT p.name as project_name, d.name as department_name, p.status, p.budget
FROM projects p
JOIN departments d ON p.department_id = d.id
ORDER BY p.budget DESC` 
    },
    { 
      label: '開発部の従業員とプロジェクト', 
      query: `SELECT e.name as employee_name, e.position, p.name as project_name, p.status
FROM employees e
JOIN departments d ON e.department = d.name
LEFT JOIN projects p ON d.id = p.department_id
WHERE d.name = '開発部'
ORDER BY e.name` 
    },
    { 
      label: '部署別予算と従業員数', 
      query: `SELECT d.name as department_name, 
       COUNT(e.id) as employee_count,
       d.budget,
       ROUND(d.budget / COUNT(e.id)) as budget_per_employee
FROM departments d
LEFT JOIN employees e ON d.name = e.department
GROUP BY d.id, d.name, d.budget
ORDER BY budget_per_employee DESC` 
    },
    { 
      label: '高給与従業員の部署情報', 
      query: `SELECT e.name, e.salary, e.position, d.name as department_name, d.location
FROM employees e
JOIN departments d ON e.department = d.name
WHERE e.salary > 6000000
ORDER BY e.salary DESC` 
    },
    { 
      label: 'プロジェクト予算集計', 
      query: `SELECT d.name as department_name,
       COUNT(p.id) as project_count,
       SUM(p.budget) as total_project_budget,
       AVG(p.budget) as avg_project_budget
FROM departments d
LEFT JOIN projects p ON d.id = p.department_id
GROUP BY d.id, d.name
HAVING COUNT(p.id) > 0
ORDER BY total_project_budget DESC` 
    },
    { 
      label: '進行中プロジェクトの詳細', 
      query: `SELECT p.name as project_name,
       d.name as department_name,
       e.name as manager_name,
       p.start_date,
       p.budget,
       p.status,
       d.location
FROM projects p
JOIN departments d ON p.department_id = d.id
LEFT JOIN employees e ON d.manager_id = e.id
WHERE p.status = '進行中'
ORDER BY p.start_date` 
    },
    { 
      label: '新規従業員追加', 
      query: `INSERT INTO employees (name, position, department, salary, hire_date)
VALUES ('新井太郎', 'ソフトウェアエンジニア', '開発部', 5500000, '2024-06-01')` 
    },
    { 
      label: '給与更新', 
      query: `UPDATE employees 
SET salary = salary * 1.1 
WHERE department = '開発部' AND salary < 6000000` 
    },
    { 
      label: '新規テーブル作成', 
      query: `CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  level INTEGER NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
)` 
    },
    { 
      label: '条件に基づく削除', 
      query: `DELETE FROM employees 
WHERE department = 'サポート部' AND salary < 5500000` 
    },
    { 
      label: 'テーブル全データ削除', 
      query: `TRUNCATE TABLE skills` 
    },
    { 
      label: 'テーブル削除', 
      query: `DROP TABLE IF EXISTS skills` 
    }
  ];

  const sqlGuidePatterns = [
    {
      category: "基本構文",
      patterns: [
        { label: "SELECT", text: "SELECT ", description: "データを取得する列を指定します" },
        { label: "FROM", text: "FROM ", description: "データを取得するテーブルを指定します" },
        { label: "WHERE", text: "WHERE ", description: "データを絞り込む条件を指定します" },
        { label: "ORDER BY", text: "ORDER BY ", description: "結果を並び替える列を指定します" },
        { label: "GROUP BY", text: "GROUP BY ", description: "データをグループ化する列を指定します" },
        { label: "HAVING", text: "HAVING ", description: "GROUP BYの結果に対する条件を指定します" },
        { label: "LIMIT", text: "LIMIT ", description: "取得する行数を制限します" },
      ]
    },
    {
      category: "結合",
      patterns: [
        { label: "INNER JOIN", text: "INNER JOIN table_name ON ", description: "両方のテーブルに存在するデータのみを結合します" },
        { label: "LEFT JOIN", text: "LEFT JOIN table_name ON ", description: "左のテーブルのデータをすべて含めて結合します" },
        { label: "RIGHT JOIN", text: "RIGHT JOIN table_name ON ", description: "右のテーブルのデータをすべて含めて結合します" },
      ]
    },
    {
      category: "集計関数",
      patterns: [
        { label: "COUNT", text: "COUNT(*)", description: "行数をカウントします" },
        { label: "SUM", text: "SUM(column)", description: "数値列の合計を計算します" },
        { label: "AVG", text: "AVG(column)", description: "数値列の平均を計算します" },
        { label: "MAX", text: "MAX(column)", description: "列の最大値を取得します" },
        { label: "MIN", text: "MIN(column)", description: "列の最小値を取得します" },
        { label: "ROUND", text: "ROUND(column, 2)", description: "数値を指定した桁数で四捨五入します" },
      ]
    },
    {
      category: "条件",
      patterns: [
        { label: "AND", text: " AND ", description: "複数の条件をすべて満たす場合に使用します" },
        { label: "OR", text: " OR ", description: "複数の条件のいずれかを満たす場合に使用します" },
        { label: "IN", text: "IN ()", description: "指定したリストの値のいずれかと一致する条件です" },
        { label: "LIKE", text: "LIKE '%%'", description: "パターンマッチング検索を行います（%は任意の文字列）" },
        { label: "BETWEEN", text: "BETWEEN value1 AND value2", description: "指定した範囲内の値を検索します" },
        { label: "IS NULL", text: "IS NULL", description: "値がNULL（空）である条件です" },
        { label: "IS NOT NULL", text: "IS NOT NULL", description: "値がNULLでない条件です" },
      ]
    },
    {
      category: "データ操作",
      patterns: [
        { label: "INSERT", text: "INSERT INTO table_name (column1, column2) VALUES (value1, value2)", description: "新しいレコードをテーブルに挿入します" },
        { label: "UPDATE", text: "UPDATE table_name SET column1 = value1 WHERE condition", description: "既存のレコードを更新します" },
        { label: "DELETE", text: "DELETE FROM table_name WHERE condition", description: "条件に一致するレコードを削除します" },
        { label: "CREATE TABLE", text: "CREATE TABLE table_name (id INTEGER PRIMARY KEY, column1 TEXT)", description: "新しいテーブルを作成します" },
        { label: "DROP TABLE", text: "DROP TABLE IF EXISTS table_name", description: "テーブルを完全に削除します" },
        { label: "TRUNCATE", text: "TRUNCATE TABLE table_name", description: "テーブルの全データを削除します（構造は残す）" },
      ]
    },
    {
      category: "テンプレート",
      patterns: [
        { 
          label: "基本SELECT", 
          text: "SELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column1;",
          description: "基本的なSELECT文のテンプレートです"
        },
        { 
          label: "JOIN例", 
          text: "SELECT t1.column1, t2.column2\nFROM table1 t1\nINNER JOIN table2 t2 ON t1.id = t2.table1_id\nWHERE condition;",
          description: "2つのテーブルを結合するクエリのテンプレートです"
        },
        { 
          label: "集計例", 
          text: "SELECT column1, COUNT(*) as count\nFROM table_name\nGROUP BY column1\nHAVING COUNT(*) > 1\nORDER BY count DESC;",
          description: "データを集計するクエリのテンプレートです"
        },
      ]
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SQLクエリエディタ</CardTitle>
            <CardDescription>
              SQLクエリを入力して実行してください。SELECT、INSERT、UPDATE、DELETE、CREATE、DROP、TRUNCATEが利用可能です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SQL Guide Section */}
              <div className="border border-border rounded-lg">
                {/* SQL Guide Header */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowSqlGuide(!showSqlGuide)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {showSqlGuide ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium">SQLガイド</p>
                    </div>
                    {showSqlGuide && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTooltips(!showTooltips);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {showTooltips ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{showTooltips ? '説明を非表示にする' : '説明を表示する'}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {showSqlGuide ? '折りたたむ' : 'SQL構文ヘルプを表示'}
                  </p>
                </div>

                {/* SQL Guide Content */}
                {showSqlGuide && (
                  <div className="border-t border-border p-3 space-y-4 bg-muted/20">
                    {/* SQL Guide Patterns */}
                    <div className="space-y-3">
                      {sqlGuidePatterns.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">{category.category}</p>
                          <div className="flex flex-wrap gap-1">
                            {category.patterns.map((pattern, patternIndex) => (
                              showTooltips ? (
                                <Tooltip key={patternIndex}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => insertText(pattern.text)}
                                      disabled={loading}
                                      className="text-xs h-7 px-2 font-mono"
                                    >
                                      {pattern.label}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{pattern.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Button
                                  key={patternIndex}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertText(pattern.text)}
                                  disabled={loading}
                                  className="text-xs h-7 px-2 font-mono"
                                >
                                  {pattern.label}
                                </Button>
                              )
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sample Queries Section */}
                    <div className="border-t border-border pt-4 space-y-3">
                      <p className="text-sm font-medium text-foreground">サンプルクエリ</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {sampleQueries.map((sample, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setQuery(sample.query)}
                            disabled={loading}
                            className="text-xs h-8 px-2"
                          >
                            {sample.label}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        上記のサンプルクエリは、複数テーブルの結合（JOIN）、集計関数、グループ化などのSQL操作を学習できます。
                      </p>
                    </div>
                  </div>
                )}
              </div>

            <div>
              <Textarea
                ref={textareaRef}
                placeholder="SELECT * FROM employees WHERE salary > 6000000"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                disabled={loading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? '実行中...' : 'クエリを実行'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery('');
                }}
                disabled={loading}
              >
                クリア
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      </div>
    </TooltipProvider>
  );
}