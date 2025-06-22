# DoorDash MCP Server

A minimal Model Context Protocol (MCP) server that bridges the DoorDash Drive API with MCP-compatible clients.

## Features

- **create_delivery_quote**: Get delivery quotes for pickup/dropoff locations
- **create_delivery**: Create new delivery requests
- **get_delivery**: Check status of existing deliveries
- **cancel_delivery**: Cancel pending deliveries
- **accept_delivery_quote**: Accept a quote and optionally include a tip
- **update_delivery**: Update delivery addresses, times, or other details

## Prerequisites

1. DoorDash Drive API access (contact DoorDash for business partnership)
2. Node.js 12+ 
3. Required environment variables:
   - `DOORDASH_DEVELOPER_ID`
   - `DOORDASH_KEY_ID` 
   - `DOORDASH_SIGNING_SECRET`

## Installation

```bash
git clone https://github.com/amannm/doordash-mcp.git
cd doordash-mcp
npm install
```

## Usage

### As MCP Server

```json
{
  "mcpServers": {
    "doordash": {
      "command": "node",
      "args": ["/path/to/doordash-mcp/index.js"],
      "env": {
        "DOORDASH_DEVELOPER_ID": "your_developer_id",
        "DOORDASH_KEY_ID": "your_key_id", 
        "DOORDASH_SIGNING_SECRET": "your_signing_secret"
      }
    }
  }
}
```

### Direct Usage

```bash
export DOORDASH_DEVELOPER_ID=your_developer_id
export DOORDASH_KEY_ID=your_key_id
export DOORDASH_SIGNING_SECRET=your_signing_secret

node index.js
```

## API Reference

### create_delivery_quote

Get a delivery quote without creating an actual delivery.

**Parameters:**
- `external_delivery_id` (required): Unique identifier
- `pickup_address` (required): Full pickup address
- `dropoff_address` (required): Full dropoff address
- `pickup_business_name`: Business name for pickup
- `pickup_phone_number`: Contact number for pickup
- `pickup_instructions`: Special pickup instructions
- `dropoff_business_name`: Business name for dropoff  
- `dropoff_phone_number`: Contact number for dropoff
- `dropoff_instructions`: Special dropoff instructions
- `order_value`: Value of order in cents

### create_delivery

Create an actual delivery request.

**Parameters:** Same as `create_delivery_quote`

### get_delivery

Check the status of an existing delivery.

**Parameters:**
- `external_delivery_id` (required): The delivery ID to check

### cancel_delivery

Cancel a pending delivery.

**Parameters:**
- `external_delivery_id` (required): The delivery ID to cancel

## Architecture

This MCP server acts as a minimal bridge:

```
MCP Client <-> DoorDash MCP Server <-> DoorDash SDK <-> DoorDash Drive API
```

The implementation minimizes transformation between the MCP protocol and DoorDash SDK, passing through requests with minimal processing.

## License

MIT
