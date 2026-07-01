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

/**
 * Splits a SQL expression string by commas, ignoring commas within quotes.
 */
function splitSqlValues(str: string): string[] {
  const result: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      current += char;
    } else if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      current += char;
    } else if (char === "," && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export const sandboxProjects = new Map<string, SandboxProject>();

/**
 * Filter rows based on a WHERE SQL clause
 */
function filterRows(rows: any[], whereClause: string, params: Record<string, any>): any[] {
  try {
    const cleanClause = whereClause.trim().replace(/\s+/g, " ");
    
    const match = cleanClause.match(/(\w+)\s*(=|!=|>|<|LIKE|IN)\s*(.*)/i);
    if (match) {
      const col = match[1].trim();
      const op = match[2].trim().toUpperCase();
      let valRaw = match[3].trim();

      if (op === "IN") {
        const inner = valRaw.replace(/^\(|\)$/g, "");
        const parts = inner.split(",").map(p => {
          let val = p.trim().replace(/^['"]|['"]$/g, "");
          if (!isNaN(val as any) && val !== "") return Number(val);
          return val;
        });

        return rows.filter(row => {
          const cell = row[col];
          if (cell === undefined) return false;
          return parts.some(p => String(p) === String(cell));
        });
      }

      let val: any = valRaw.replace(/[,;()]/g, "");
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
      let workingQuery = query;
      let limit: number | null = null;
      let orderByCol: string | null = null;
      let orderByDir: "ASC" | "DESC" = "ASC";

      const limitMatch = workingQuery.match(/\s+LIMIT\s+(\d+)/i);
      if (limitMatch) {
        limit = parseInt(limitMatch[1]);
        workingQuery = workingQuery.replace(/\s+LIMIT\s+(\d+)/i, "");
      }

      const orderMatch = workingQuery.match(/\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        orderByCol = orderMatch[1];
        if (orderMatch[2]) {
          orderByDir = orderMatch[2].toUpperCase() === "DESC" ? "DESC" : "ASC";
        }
        workingQuery = workingQuery.replace(/\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i, "");
      }

      const selectMatch = workingQuery.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);
      if (selectMatch) {
        const fields = selectMatch[1].split(",").map(f => f.trim().replace(/['"`]/g, ""));
        const tableName = selectMatch[2];
        const whereClause = selectMatch[3];

        const table = getTable(tableName);
        let rows = [...table];

        if (whereClause) {
          rows = filterRows(rows, whereClause, params);
        }

        if (orderByCol) {
          const col = orderByCol;
          const dir = orderByDir;
          rows.sort((a, b) => {
            const valA = a[col];
            const valB = b[col];
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            if (valA === valB) return 0;
            if (typeof valA === "number" && typeof valB === "number") {
              return dir === "ASC" ? valA - valB : valB - valA;
            }
            return dir === "ASC"
              ? String(valA).localeCompare(String(valB))
              : String(valB).localeCompare(String(valA));
          });
        }

        if (limit !== null) {
          rows = rows.slice(0, limit);
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
        const valsRaw = splitSqlValues(insertMatch[3]);

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

        const sets = splitSqlValues(setsRaw);
        rowsToUpdate.forEach(row => {
          sets.forEach(setStr => {
            const eqIdx = setStr.indexOf("=");
            if (eqIdx !== -1) {
              const col = setStr.substring(0, eqIdx).trim().replace(/['"`]/g, "");
              let val: any = setStr.substring(eqIdx + 1).trim();

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
 * Generates a realistic mock row based on column type and name
 */
function generateMockRow(columns: any[], idVal: number): Record<string, any> {
  const row: Record<string, any> = {};
  
  columns.forEach((c: any) => {
    const colName = c.name.toLowerCase();
    const colType = c.type.toLowerCase();
    
    if (colName === "id") {
      row[c.name] = idVal;
      return;
    }
    
    // Value based on name context
    if (colName.includes("email")) {
      row[c.name] = `test_user_${idVal}@example.com`;
    } else if (colName.includes("username") || colName.includes("login")) {
      row[c.name] = `mock_user_${idVal}`;
    } else if (colName.includes("name") || colName.includes("title")) {
      if (colName.includes("first")) {
        row[c.name] = idVal === 1 ? "Alex" : "Jane";
      } else if (colName.includes("last")) {
        row[c.name] = idVal === 1 ? "Smith" : "Doe";
      } else {
        row[c.name] = `Mock Title / Name #${idVal}`;
      }
    } else if (colName.includes("password") || colName.includes("passwd")) {
      row[c.name] = "$2b$10$32r473gq74tq34tgmockhashedpassword";
    } else if (colName.includes("role")) {
      row[c.name] = idVal === 1 ? "ADMIN" : "USER";
    } else if (colName.includes("price") || colName.includes("amount") || colName.includes("total")) {
      row[c.name] = idVal * 99.99;
    } else if (colName.includes("stock") || colName.includes("quantity") || colName.includes("qty")) {
      row[c.name] = idVal * 10 + 5;
    } else if (colName.includes("status")) {
      row[c.name] = idVal === 1 ? "ACTIVE" : "PENDING";
    } else if (colName.includes("date") || colName.includes("time") || colName.includes("created_at") || colName.includes("updated_at")) {
      row[c.name] = new Date(Date.now() - idVal * 3600 * 1000).toISOString();
    } else if (colName.includes("description") || colName.includes("content") || colName.includes("text")) {
      row[c.name] = `This is a dynamic mock content description for row #${idVal}.`;
    } else if (colName.includes("phone")) {
      row[c.name] = `+48 500 600 70${idVal}`;
    } else {
      // Fallback by type
      if (colType.includes("int") || colType.includes("num") || colType.includes("double") || colType.includes("float") || colType.includes("decimal")) {
        row[c.name] = idVal;
      } else if (colType.includes("bool") || colType.includes("tinyint(1)")) {
        row[c.name] = idVal % 2 === 1;
      } else {
        row[c.name] = `Value_${idVal}`;
      }
    }
  });

  // Force add ID column if not parsed but is standard
  if (row["id"] === undefined && row["ID"] === undefined) {
    row["id"] = idVal;
  }

  return row;
}

/**
 * Initializes realistic mock database rows for parsed schemas
 */
export function initializeMockData(tables: any[]): Record<string, Array<Record<string, any>>> {
  const state: Record<string, Array<Record<string, any>>> = {};

  tables.forEach(table => {
    const columns = table.columns || [];
    state[table.name] = [
      generateMockRow(columns, 1),
      generateMockRow(columns, 2)
    ];
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
