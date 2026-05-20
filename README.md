# Domotz MCP Server

> **Connect Claude AI to the Domotz network monitoring platform via the Model Context Protocol.**  
> Natural language access to 133 API actions across 10 capability domains — enabling agent-driven infrastructure monitoring, diagnostics, and automation at scale.

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-Node.js%2018+-green)](https://nodejs.org)

---

## Why This Exists

Network monitoring platforms like Domotz contain enormous operational intelligence — device status, latency history, configuration state, alert profiles, topology — but accessing that intelligence requires knowing the right menus, the right dashboards, and the right API calls.

This MCP server eliminates that friction. It exposes the full Domotz API surface to Claude as a structured set of tools, so you can query your infrastructure in plain English and get back actionable answers.

Instead of navigating dashboards:

> *"Show me all offline devices on the Seattle collector and their last-seen timestamps"*

Instead of writing API calls:

> *"What's the RTD latency trend for my core switch over the last 7 days, and is it within normal range?"*

This is the pattern the Model Context Protocol enables: a standardized interface between AI agents and external systems, designed for composability, extensibility, and production-grade reliability.

---

## Architecture

```
Claude (Claude Desktop)
        |
        |  MCP over stdio (JSON-RPC 2.0)
        |
Domotz MCP Server (index.js)
        |
        |-- domotz_agents (31 actions)
        |-- domotz_devices (17 actions)
        |-- domotz_monitoring (13 actions)
        |-- domotz_alerts (8 actions)
        |-- domotz_network (14 actions)
        |-- domotz_configuration (8 actions)
        |-- domotz_power (7 actions)
        |-- domotz_drivers (8 actions)
        |-- domotz_inventory (19 actions)
        |-- domotz_account (5 actions)
        |
        |  HTTPS / REST
        |
Domotz API
```

### How it works

The server implements the [Model Context Protocol](https://modelcontextprotocol.io) over stdio transport. When Claude is configured to use this server, it discovers 10 available tools at startup — one per Domotz capability domain. Each tool accepts an `action` parameter that maps to a specific Domotz API endpoint.

**Request flow:**
1. User asks Claude a natural language question about their infrastructure
2. Claude selects the appropriate tool and action based on the request
3. The MCP server translates the tool call into a Domotz REST API request
4. The API response is returned to Claude, which formats it as a human-readable answer

**Tool design rationale:** Rather than exposing 133 individual tools (one per API endpoint), the server uses a category-per-tool architecture with an `action` parameter. This keeps Claude's tool list manageable, groups related operations semantically, and makes it easier to extend without growing the tool surface area.

### File structure

```
domotz-mcp-server/
├── index.js                          # MCP server entry point, tool registration
├── lib/
│   ├── api.js                        # Domotz API client (Axios, auth, base URL)
│   └── registry.js                   # Generic action dispatcher
├── categories/                       # One module per capability domain
│   ├── agents.js                     # domotz_agents -- 31 actions
│   ├── devices.js                    # domotz_devices -- 17 actions
│   ├── monitoring.js                 # domotz_monitoring -- 13 actions
│   ├── alerts.js                     # domotz_alerts -- 8 actions
│   ├── network.js                    # domotz_network -- 14 actions
│   ├── configuration.js              # domotz_configuration -- 8 actions
│   ├── power.js                      # domotz_power -- 7 actions
│   ├── drivers.js                    # domotz_drivers -- 8 actions
│   ├── inventory.js                  # domotz_inventory -- 19 actions
│   └── account.js                    # domotz_account -- 5 actions
└── .claude/skills/domotz-api/        # Claude Code skill (auto-loaded in Claude Code)
    ├── SKILL.md
    └── references/tool-reference.md
```

---

## Capabilities

10 tools covering 133 Domotz API actions:

| Tool | Actions | What you can do |
|---|---|---|
| `domotz_agents` | 31 | Collector status, uptime, VPN, topology, IP conflicts, variables |
| `domotz_devices` | 17 | Device list, status history, RTD metrics, connectivity |
| `domotz_monitoring` | 13 | SNMP/TCP sensors, triggers, sensor history |
| `domotz_alerts` | 8 | Alert profiles, bind/unbind to collectors and devices |
| `domotz_network` | 14 | Scan policies, interfaces, routed networks, excluded devices |
| `domotz_configuration` | 8 | Config backups, credentials, SNMP authentication |
| `domotz_power` | 7 | Power actions, outlet control, device associations |
| `domotz_drivers` | 8 | Custom drivers, associations, driver action execution |
| `domotz_inventory` | 19 | Custom fields, tags, device profiles, device types |
| `domotz_account` | 5 | User info, API usage stats, areas, team management |

**Composite tools** (combine multiple API calls into a single operation):

| Tool | What it does |
|---|---|
| `domotz_get_device_full_status` | Combines 5 API calls — device info, status history, SNMP sensors, TCP sensors, and alert bindings |
| `domotz_get_agent_overview` | Combines agent details, full device list, and uptime into one response |
| `domotz_search_devices` | Searches devices by name or IP address across one or all collectors |

All 13 tools include MCP annotations (`readOnlyHint`, `destructiveHint`) so clients can assess the risk of a call before executing it.

---

## Prerequisites

- [Domotz account](https://www.domotz.com) with API access enabled
- [Claude Desktop](https://claude.ai/download) installed
- Node.js 18+
- Domotz API key (see setup below)

---

## Setup

### 1. Get your Domotz API key

Log into the [Domotz Portal](https://portal.domotz.com) → **Account Settings** → **API Keys** → **Generate New Key**. Save it — you won't see it again.

### 2. Clone the repo

```bash
git clone https://github.com/myoung76/domotz-mcp-server.git
cd domotz-mcp-server
npm install
```

### 3. Configure Claude Desktop

Find your Claude Desktop config file:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

Add the Domotz server block:

```json
{
  "mcpServers": {
    "domotz": {
      "command": "node",
      "args": ["/FULL/PATH/TO/domotz-mcp-server/index.js"],
      "env": {
        "DOMOTZ_API_KEY": "your-api-key-here",
        "DOMOTZ_API_BASE_URL": "https://api-us-east-1-cell-1.domotz.com/public-api/v1"
      }
    }
  }
}
```

**Regional API URLs:**
- US: `https://api-us-east-1-cell-1.domotz.com/public-api/v1`
- Europe: `https://api-eu-west-1-cell-1.domotz.com/public-api/v1`

### 4. Restart Claude Desktop and verify

Restart Claude Desktop, then ask:
> *"List my Domotz collectors"*

If it works, you'll see your collector list. If not, see Troubleshooting below.

---

## Example queries

**Network status**
- *"Which devices have been offline for more than 24 hours?"*
- *"Give me a summary of all collectors and their current connection status"*
- *"Are there any active IP conflicts on my network?"*

**Performance & diagnostics**
- *"Show me RTD latency history for device 67890 over the past week"*
- *"What's the internet speed test history for the main office collector?"*
- *"List all SNMP sensors on device 11111 and their current values"*

**Inventory & reporting**
- *"List all devices tagged as 'critical-infrastructure'"*
- *"Show me every device added to the network in the last 30 days"*
- *"What's my current Domotz API usage this month?"*

**Configuration**
- *"List all alert profiles and which collectors they're bound to"*
- *"Show me all custom drivers and their associated devices"*

---

## Troubleshooting

**Claude doesn't see Domotz tools**
- Verify the full path to `index.js` in your config is correct
- Confirm Node.js 18+ is installed: `node --version`
- Restart Claude Desktop completely (quit, don't just close)
- Check the config file is valid JSON (no trailing commas)

**API calls failing**
- Confirm your API key is active in the Domotz portal
- Verify you're using the correct regional URL for your account
- Check that your Domotz account has API permissions enabled

**Rate limiting**
- The Domotz API enforces rate limits. If you hit them, wait 30–60 seconds before retrying.

---

## Security

- **Never commit your API key** — keep it in `claude_desktop_config.json` only, which is local to your machine
- **Keys have full account access** — treat them like passwords; rotate immediately if exposed
- **This repo is safe to share** — it contains only endpoint definitions, no credentials

---

## Context

This MCP server was built as part of the product work to bring agentic AI workflows to the Domotz platform. The goal: make the full Domotz API surface accessible to AI agents without requiring developers to write custom integrations for each use case.

The [Model Context Protocol](https://modelcontextprotocol.io) makes this composable — the same server works with any MCP-compatible client, not just Claude. As the MCP ecosystem matures, infrastructure platforms like Domotz become first-class participants in agentic workflows: not just data sources, but active participants that agents can query, configure, and act through.

For a broader look at MCP architecture patterns, agent platform design, and related thinking: [github.com/myoung76/agent-platform-notes](https://github.com/myoung76/agent-platform-notes)

---

## Resources

- [Domotz API Documentation](https://docs.domotz.com/api)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP Server Registry](https://github.com/mcp)
- [Claude Desktop](https://claude.ai/download)

---

## License

MIT — see [LICENSE](LICENSE)
