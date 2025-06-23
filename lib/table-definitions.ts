import { Database } from 'sql.js';

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
}

export interface Department {
  id: number;
  name: string;
  manager_id: number | null;
  budget: number;
  location: string;
}

export interface Project {
  id: number;
  name: string;
  department_id: number;
  start_date: string;
  end_date: string | null;
  budget: number;
  status: string;
}

export function createTables(db: Database) {
  // Create employees table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      department TEXT NOT NULL,
      salary INTEGER NOT NULL,
      hire_date DATE NOT NULL
    );
  `);

  // Create departments table
  db.run(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      manager_id INTEGER,
      budget INTEGER NOT NULL,
      location TEXT NOT NULL,
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    );
  `);

  // Create projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      budget INTEGER NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );
  `);
}

export function insertSampleData(db: Database) {
  // Insert employees
  const employees = [
    ['田中太郎', 'ソフトウェアエンジニア', '開発部', 6000000, '2020-04-01'],
    ['山田花子', 'プロジェクトマネージャー', '開発部', 8000000, '2018-03-15'],
    ['佐藤健', 'デザイナー', 'デザイン部', 5500000, '2021-01-10'],
    ['鈴木美咲', 'データアナリスト', 'データ分析部', 6500000, '2019-07-20'],
    ['高橋直樹', 'セールスマネージャー', '営業部', 7500000, '2017-11-05'],
    ['伊藤愛', 'マーケティングスペシャリスト', 'マーケティング部', 5800000, '2020-09-01'],
    ['渡辺翔', 'DevOpsエンジニア', '開発部', 6800000, '2019-02-14'],
    ['小林優子', '人事マネージャー', '人事部', 7000000, '2016-06-30'],
    ['加藤大輝', 'フロントエンドエンジニア', '開発部', 5700000, '2021-08-15'],
    ['吉田真理', 'カスタマーサクセス', 'サポート部', 5200000, '2022-03-01']
  ];

  const stmt = db.prepare(
    'INSERT INTO employees (name, position, department, salary, hire_date) VALUES (?, ?, ?, ?, ?)'
  );
  
  employees.forEach(emp => {
    stmt.run(emp);
  });
  
  stmt.free();

  // Insert departments
  const departments = [
    ['開発部', 2, 50000000, '東京'],
    ['デザイン部', 3, 20000000, '東京'],
    ['データ分析部', 4, 30000000, '大阪'],
    ['営業部', 5, 40000000, '東京'],
    ['マーケティング部', 6, 25000000, '東京'],
    ['人事部', 8, 15000000, '東京'],
    ['サポート部', 10, 18000000, '福岡']
  ];

  const deptStmt = db.prepare(
    'INSERT INTO departments (name, manager_id, budget, location) VALUES (?, ?, ?, ?)'
  );
  
  departments.forEach(dept => {
    deptStmt.run(dept);
  });
  
  deptStmt.free();

  // Insert projects
  const projects = [
    ['新規ECサイト開発', 1, '2024-01-15', '2024-12-31', 20000000, '進行中'],
    ['モバイルアプリUI改善', 2, '2024-03-01', '2024-06-30', 5000000, '進行中'],
    ['売上データ分析システム', 3, '2024-02-01', '2024-08-31', 10000000, '進行中'],
    ['顧客管理システム更新', 1, '2023-09-01', '2024-03-31', 15000000, '完了'],
    ['ブランドリニューアル', 5, '2024-04-01', null, 8000000, '計画中'],
    ['社内ポータルサイト', 6, '2024-01-01', '2024-06-30', 3000000, '進行中']
  ];

  const projStmt = db.prepare(
    'INSERT INTO projects (name, department_id, start_date, end_date, budget, status) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  projects.forEach(proj => {
    projStmt.run(proj);
  });
  
  projStmt.free();
}