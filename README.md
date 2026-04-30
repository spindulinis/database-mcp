# database-mcp

MCP server exposing database to AI via configurable environment variables.

## Configuration

Connection is driven by environment variables:

| Env Variable         | Example          | Description                                     |
|----------------------|------------------|-------------------------------------------------|
| `DB_SERVER`          | `localhost`      | Database server host address                    |
| `DB_PORT`            | `1433`           | Port number for the database connection         |
| `DB_USER`            | `sa`             | Username for database authentication            |
| `DB_PASSWORD`        | `your_password`  | Password for database authentication            |
| `DB_DATABASE`        | `master`         | Name of the database to connect to              |
| `DB_CONNECTION_TIMEOUT` | `15000`        | Connection timeout in milliseconds              |
| `DB_REQUEST_TIMEOUT` | `15000`           | Request timeout in milliseconds                 |
| `DB_ENCRYPT`         | `false`          | Whether to use encryption for the connection    |
| `DB_TRUST_CERT`      | `true`           | Whether to trust the server certificate         |

Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

Then register the server in `.claude/settings.json`

```json
{
  "mcpServers": {
    "database-mcp": {
      "command": "node",
      "args": [
        "/path/to/database-mcp/dist/index.js"
      ]
    }
  },
  "enableAllProjectMcpServer": true
}
```

## Tools

| Tool             | Description                         |
|------------------|-------------------------------------|
| `list-tables`    | Lists all tables in the database    |
| `describe_table` | Shows columns and types for a table |
| `query`          | Runs a read-only `SELECT` statment  |

## Setup

```bash
npm install
npm run build
```

## Usage

AI auto-starts the server via '.claude/settings.json' when you open the project. No manual setup required.

## Notes

- Only `SELECT` queries are permitted - write operations are not allowed.
- All enviroment variables are required - the server will throw errors if any are missing.