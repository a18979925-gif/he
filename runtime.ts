import { CodeScopeAnalysis } from "./src/types.js";

interface SandboxLog {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  responseTime: number;
  query?: string;
  payload?: string;
  response?: string;
}

export interface SandboxProject {
  projectName: string;
  dbState: Record<string, Array<Record<string, any>>>;
  logs: SandboxLog[];
  analysis?: CodeScopeAnalysis;
}

export const sandboxProjects = new Map<string, SandboxProject>();

/**
 * Filter rows based on a WHERE SQL clause
 */
function filterRows(rows: any[], whereClause: string, params: Record<string, any>): any[] {
  try {
    const cleanClause = whereClause.trim().replace(/\s+/g, " ");
    
    // Check simple forms: "id = 1" or "id = $1" or "email = :email"
    const match = cleanClause.match(/(\w+)\s*(=|!=|>|<|LIKE)\s*(.*)/i);
    if (match) {
      const col = match[1].trim();
      const op = match[2].trim().toUpperCase();
      let valRaw = match[3].trim().replace(/[,;()]/g, "");

      let val: any = valRaw;
      if (val.startsWith("$")) {
        const paramIdx = parseInt(val.substring(1)) - 1;
        val = Object.values(params)[paramIdx];
      } else if (val.startsWith(":")) {
        const paramName = val.substring(1);
        val = params[paramName];
      } else {
        val = val.replace(/^['"]|['"]$/g, "");
        if (!isNaN(val) && val !== "") val = Number(val);
      }

      return rows.filter(row => {
        const cell = row[col];
        if (cell === undefined) return false;
        
        if (op === "=") return String(cell) === String(val);
        if (op === "!=") return String(cell) !== String(val);
        if (op === ">") return Number(cell) > Number(val);
        if (op === "<") return Number(cell) < Number(val);
        if (op === "LIKE") return String(cell).toLowerCase().includes(String(val).toLowerCase());
        return true;
      });
    }
  } catch (err) {
    console.error("Error in filterRows SQL helper:", err);
  }
  return rows;
}

/**
 * Executes a light SQL query on in-memory dbState
 */
export function executeSQL(
  sql: string,
  dbState: Record<string, Array<Record<string, any>>>,
  params: Record<string, any> = {}
): { rows: any[]; affectedRows: number; error?: string } {
  try {
    const query = sql.trim().replace(/\s+/g, " ");
    
    const getTable = (name: string) => {
      const cleaned = name.replace(/['"`]/g, "").trim();
      // Ensure key is lowercase or original
      let key = Object.keys(dbState).find(k => k.toLowerCase() === cleaned.toLowerCase()) || cleaned;
      if (!dbState[key]) {
        dbState[key] = [];
      }
      return dbState[key];
    };

    // 1. SELECT Query
    if (query.toUpperCase().startsWith("SELECT")) {
      const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);
      if (selectMatch) {
        const fields = selectMatch[1].split(",").map(f => f.trim().replace(/['"`]/g, ""));
        const tableName = selectMatch[2];
        const whereClause = selectMatch[3];

        const table = getTable(tableName);
        let rows = [...table];

        if (whereClause) {
          rows = filterRows(rows, whereClause, params);
        }

        const projectedRows = rows.map(row => {
          if (fields.includes("*")) return row;
          const newRow: Record<string, any> = {};
          fields.forEach(f => {
            if (row[f] !== undefined) newRow[f] = row[f];
          });
          return newRow;
        });

        return { rows: projectedRows, affectedRows: 0 };
      }
    }

    // 2. INSERT Query
    if (query.toUpperCase().startsWith("INSERT")) {
      const insertMatch = query.match(/INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
      if (insertMatch) {
        const tableName = insertMatch[1];
        const cols = insertMatch[2].split(",").map(c => c.trim().replace(/['"`]/g, ""));
        const valsRaw = insertMatch[3].split(",").map(v => v.trim());

        const table = getTable(tableName);
        const newId = table.length > 0 ? Math.max(...table.map(r => typeof r.id === 'number' ? r.id : 0)) + 1 : 1;
        const newRow: Record<string, any> = { id: newId };

        cols.forEach((col, idx) => {
          let val: any = valsRaw[idx];
          if (val) {
            if (val.startsWith("$")) {
              const paramIdx = parseInt(val.substring(1)) - 1;
              val = Object.values(params)[paramIdx] ?? val;
            } else if (val.startsWith(":")) {
              const paramName = val.substring(1);
              val = params[paramName] ?? val;
            } else {
              val = val.replace(/^['"]|['"]$/g, "");
              if (!isNaN(val) && val !== "") val = Number(val);
            }
          }
          newRow[col] = val;
        });

        table.push(newRow);
        return { rows: [newRow], affectedRows: 1 };
      }
    }

    // 3. UPDATE Query
    if (query.toUpperCase().startsWith("UPDATE")) {
      const updateMatch = query.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?/i);
      if (updateMatch) {
        const tableName = updateMatch[1];
        const setsRaw = updateMatch[2];
        const whereClause = updateMatch[3];

        const table = getTable(tableName);
        let rowsToUpdate = table;

        if (whereClause) {
          rowsToUpdate = filterRows(table, whereClause, params);
        }

        const sets = setsRaw.split(",").map(s => s.trim());
        rowsToUpdate.forEach(row => {
          sets.forEach(setStr => {
            const parts = setStr.split("=");
            if (parts.length === 2) {
              const col = parts[0].trim().replace(/['"`]/g, "");
              let val: any = parts[1].trim();

              if (val.startsWith("$")) {
                const paramIdx = parseInt(val.substring(1)) - 1;
                val = Object.values(params)[paramIdx] ?? val;
              } else if (val.startsWith(":")) {
                const paramName = val.substring(1);
                val = params[paramName] ?? val;
              } else {
                val = val.replace(/^['"]|['"]$/g, "");
                if (!isNaN(val) && val !== "") val = Number(val);
              }
              row[col] = val;
            }
          });
        });

        return { rows: rowsToUpdate, affectedRows: rowsToUpdate.length };
      }
    }

    // 4. DELETE Query
    if (query.toUpperCase().startsWith("DELETE")) {
      const deleteMatch = query.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);
      if (deleteMatch) {
        const tableName = deleteMatch[1];
        const whereClause = deleteMatch[2];

        const table = getTable(tableName);
        let affectedRows = 0;

        if (whereClause) {
          const rowsToDelete = filterRows(table, whereClause, params);
          affectedRows = rowsToDelete.length;
          dbState[tableName] = table.filter(row => !rowsToDelete.includes(row));
        } else {
          affectedRows = table.length;
          dbState[tableName] = [];
        }

        return { rows: [], affectedRows };
      }
    }

    // 5. CREATE TABLE Query
    if (query.toUpperCase().startsWith("CREATE TABLE")) {
      const createMatch = query.match(/CREATE\s+TABLE\s+(\w+)/i);
      if (createMatch) {
        const tableName = createMatch[1];
        // Normalize table name key
        if (!dbState[tableName]) {
          dbState[tableName] = [];
          return { rows: [], affectedRows: 0 };
        } else {
          return { rows: [], affectedRows: 0, error: `Table '${tableName}' already exists.` };
        }
      }
    }

    // 6. DROP TABLE Query
    if (query.toUpperCase().startsWith("DROP TABLE")) {
      const dropMatch = query.match(/DROP\s+TABLE\s+(\w+)/i);
      if (dropMatch) {
        const tableName = dropMatch[1];
        const key = Object.keys(dbState).find(k => k.toLowerCase() === tableName.toLowerCase());
        if (key) {
          delete dbState[key];
          return { rows: [], affectedRows: 0 };
        } else {
          return { rows: [], affectedRows: 0, error: `Table '${tableName}' does not exist.` };
        }
      }
    }
  } catch (err: any) {
    return { rows: [], affectedRows: 0, error: err.message };
  }

  return { rows: [], affectedRows: 0 };
}

/**
 * Initializes realistic mock database rows for parsed schemas
 */
export function initializeMockData(tables: any[]): Record<string, Array<Record<string, any>>> {
  const state: Record<string, Array<Record<string, any>>> = {};

  tables.forEach(table => {
    const name = table.name.toLowerCase();
    state[table.name] = [];

    if (name.includes("user") || name.includes("customer")) {
      state[table.name] = [
        { id: 1, username: "alex_dev", email: "alex@example.com", role: "DEVELOPER", created_at: new Date().toISOString() },
        { id: 2, username: "jane_mgr", email: "jane@example.com", role: "ADMIN", created_at: new Date().toISOString() }
      ];
    } else if (name.includes("product") || name.includes("item")) {
      state[table.name] = [
        { id: 1, name: "Premium Enterprise Subscription", price: 299.00, stock: 15, category: "SaaS" },
        { id: 2, name: "Consulting Support Hour", price: 150.00, stock: 99, category: "Service" }
      ];
    } else if (name.includes("order") || name.includes("transaction")) {
      state[table.name] = [
        { id: 1, userId: 1, totalPrice: 299.00, status: "PAID", created_at: new Date().toISOString() },
        { id: 2, userId: 2, totalPrice: 150.00, status: "PENDING", created_at: new Date().toISOString() }
      ];
    } else if (name.includes("post") || name.includes("article") || name.includes("blog")) {
      state[table.name] = [
        { id: 1, title: "Getting Started with Live CodeScope Runtimes", content: "A deep dive into real in-memory databases.", published: true },
        { id: 2, title: "Why Static Analyzers Love TypeScript", content: "Exploring abstract syntax trees with AI-Oracle.", published: false }
      ];
    } else {
      // Default fallback single row
      const fallbackRow: Record<string, any> = { id: 1 };
      table.columns.forEach((c: any) => {
        if (c.name !== "id") {
          fallbackRow[c.name] = c.type.toLowerCase().includes("int") || c.type.toLowerCase().includes("num") ? 0 : "Default Value";
        }
      });
      state[table.name] = [fallbackRow];
    }
  });

  return state;
}

/**
 * Matches a request URL pattern with dynamic routing parameters
 */
export function matchRoute(pattern: string, actualUrl: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const actualParts = actualUrl.split("/").filter(Boolean);

  if (patternParts.length !== actualParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].substring(1);
      params[paramName] = actualParts[i];
    } else if (patternParts[i].toLowerCase() !== actualParts[i].toLowerCase()) {
      return null;
    }
  }

  return params;
}
