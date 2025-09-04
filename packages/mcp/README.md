# @mdui/mcp

An MCP server tailored for mdui. It provides read-only, offline, deterministic tools to discover components, icons, CSS tokens, and documentation. Designed for AI agents and IDEs to query structured data reliably.

## Available tools

- `list_components` — Lists all mdui Web Components (excluding standalone icon elements).
- `get_component_metadata` — Retrieves detailed API metadata for a component by tag name.
- `list_css_classes` — Lists all global CSS utility classes with brief descriptions.
- `list_css_variables` — Lists all global CSS custom properties (design tokens).
- `list_documents` — Lists all documentation pages.
- `get_document` — Fetches a documentation page by key or component tag name.
- `list_icon_codes` — Lists icon codes for a Material Icons variant.
- `list_icon_components` — Lists standalone icon custom elements and their import statements for a variant.

## Setup

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "mdui": {
      "command": "npx",
      "args": ["-y", "@mdui/mcp"]
    }
  }
}
```
