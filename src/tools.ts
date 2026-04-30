import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mysql from 'mysql2/promise';
import { getPool } from "./db.js";

type ToolResponse = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function ok(data: unknown): ToolResponse {
  return {
    content: [{
      type: "text",
      text: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    }]
  };
}

function err(message: string): ToolResponse {
  return {
    content: [{ type: "text", text: message }],
    isError: true
  };
}

async function withDb<T>(fn: (db: mysql.Pool) => Promise<T>): Promise<ToolResponse> {
  try {
    const pool = getPool();
    const result = await fn(pool);
    return ok(result);
  } catch (error: any) {
    return err(error.message);
  }
}

export function registerTools(server: McpServer) {
  server.registerTool(
    "list_tables",
    {
      description: "List all tables in the database",
    },
    async () => withDb(async (db) => {
      const [rows] = await db.query<mysql.RowDataPacket[]>(`
        SELECT TABLE_NAME, TABLE_SCHEMA
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME
      `);

      const tables = rows.map(row => `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`);
      return tables.length > 0 ? tables.join("\n") : "No tables found.";
    })
  );

  server.registerTool(
    "describe_table",
    {
      description: "Show the schema of a specific table",
      inputSchema: {
        tableName: z.string().describe("The name of the table (optionally schema-qualified)"),
      },
    },
    async ({ tableName }: { tableName: string }) => withDb(async (db) => {
      let schema: string;
      let table: string;

      if (tableName.includes('.')) {
        [schema, table] = tableName.split('.');
      } else {
        const [dbRows] = await db.query<mysql.RowDataPacket[]>('SELECT DATABASE() AS db');
        schema = dbRows[0].db;
        table = tableName;
      }

      const [rows] = await db.query<mysql.RowDataPacket[]>(
        `SELECT
           COLUMN_NAME,
           DATA_TYPE,
           CHARACTER_MAXIMUM_LENGTH,
           IS_NULLABLE
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [schema, table]
      );

      if (rows.length === 0) {
        throw new Error(`Table ${tableName} not found.`);
      }

      const description = rows.map(col =>
        `${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})${col.IS_NULLABLE === 'YES' ? ' NULL' : ' NOT NULL'}`
      ).join("\n");

      return `Schema for ${tableName}:\n${description}`;
    })
  );

  server.registerTool(
    "execute_select",
    {
      description: "Execute a SELECT query on the database. Only SELECT statements are allowed.",
      inputSchema: {
        query: z.string().describe("The SQL SELECT query to execute"),
      },
    },
    async ({ query }: { query: string }) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery.toLowerCase().startsWith("select")) {
        return err("Only SELECT queries are allowed.");
      }

      return withDb(async (db) => {
        const [rows] = await db.query<mysql.RowDataPacket[]>(trimmedQuery);
        return rows;
      });
    }
  );
}
