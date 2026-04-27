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
