# database-mcp

MCP server exposing database to AI via configurable environment variables.

## Configuration

Connection is driven by environment variables:

| Env Variable            | Example          | Description                              |
|-------------------------|------------------|------------------------------------------|
| `DB_SERVER`             | `localhost`      | Database server host address             |
| `DB_PORT`               | `3306`           | Port number for the database connection  |
| `DB_USER`               | `your_user`      | Username for database authentication     |
| `DB_PASSWORD`           | `your_password`  | Password for database authentication     |
| `DB_DATABASE`           | `your_database`  | Name of the database to connect to       |
| `DB_CONNECTION_TIMEOUT` | `15000`          | Connection timeout in milliseconds       |

Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

Then register the server using the Claude CLI (replace values as needed):

```bash
claude mcp add database-mcp \
  -e DB_SERVER=localhost \
  -e DB_PORT=3306 \
  -e DB_USER=your_user \
  -e DB_PASSWORD=your_password \
  -e DB_DATABASE=your_database \
  -e DB_CONNECTION_TIMEOUT=15000 \
  -- node /path/to/database-mcp/dist/index.js
```

To remove the server:

```bash
claude mcp remove database-mcp
```

Alternatively, register manually in your local `.claude/settings.json`:

```json
{
  "mcpServers": {
    "database-mcp": {
      "command": "node",
      "args": [
        "--env-file=.env",
        "/path/to/database-mcp/dist/index.js"
      ],
      "cwd": "/path/to/database-mcp"
    }
  },
  "enableAllProjectMcpServer": true
}
```

## Tools

| Tool             | Description                              |
|------------------|------------------------------------------|
| `list_tables`    | Lists all tables in the database         |
| `describe_table` | Shows columns and types for a table      |
| `execute_select` | Runs a read-only `SELECT` statement      |

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