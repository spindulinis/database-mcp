import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DB_CONFIG } from './config.js';
import { registerTools } from './tools.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const { database: dbName, host: dbServer, port: dbPort } = DB_CONFIG;

const server = new McpServer({
  name: 'database-mcp',
  version: '0.0.1',
}, {
  instructions: `
  You are connected to the database ${dbName} on ${dbServer}:${dbPort}
  
  Guidelines
  - Only SELECT queries are permitted; write operations are blocked.
  - Use describe_table before querying an unfamiliar table to understand its structure.
  - User list_tables to discover available tables when schema is unknown.
  - Prefer parameterised patters when constructing dynamic queries to avoid injection risks.
  - Columns and table names may be case-sensitive depending on the collation - match casing from describe_table output.
  `.trim()
});

registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);