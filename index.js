#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DoorDashClient } from '@doordash/sdk';
import { fileURLToPath } from 'url';

const server = new Server(
  {
    name: 'doordash-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize DoorDash client
let ddClient = null;

// Test helper to override DoorDash client
function __setDoorDashClient(client) {
  ddClient = client;
}

function initializeDoorDashClient() {
  const developerId = process.env.DOORDASH_DEVELOPER_ID;
  const keyId = process.env.DOORDASH_KEY_ID;
  const signingSecret = process.env.DOORDASH_SIGNING_SECRET;
  
  if (!developerId || !keyId || !signingSecret) {
    console.error('Missing required DoorDash environment variables: DOORDASH_DEVELOPER_ID, DOORDASH_KEY_ID, DOORDASH_SIGNING_SECRET');
    return null;
  }
  
  return new DoorDashClient({
    developer_id: developerId,
    key_id: keyId,
    signing_secret: signingSecret,
  });
}

// Tool: Create delivery quote
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!ddClient) {
    ddClient = initializeDoorDashClient();
    if (!ddClient) {
      throw new Error('DoorDash client not initialized. Please set environment variables.');
    }
  }

  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_delivery_quote':
      try {
        const response = await ddClient.deliveryQuote(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`DoorDash API error: ${error.message}`);
      }

    case 'create_delivery':
      try {
        const response = await ddClient.createDelivery(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`DoorDash API error: ${error.message}`);
      }

    case 'get_delivery':
      try {
        const response = await ddClient.getDelivery(args.external_delivery_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`DoorDash API error: ${error.message}`);
      }

    case 'cancel_delivery':
      try {
        const response = await ddClient.cancelDelivery(args.external_delivery_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`DoorDash API error: ${error.message}`);
      }

    case 'accept_delivery_quote':
      try {
        const { external_delivery_id, ...acceptArgs } = args;
        const response = await ddClient.deliveryQuoteAccept(external_delivery_id, acceptArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`DoorDash API error: ${error.message}`);
      }

    case 'update_delivery':
      try {
        const { external_delivery_id, ...updateArgs } = args;
        const response = await ddClient.updateDelivery(external_delivery_id, updateArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`DoorDash API error: ${error.message}`);
      }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_delivery_quote',
        description: 'Get a quote for a delivery request',
        inputSchema: {
          type: 'object',
          properties: {
            external_delivery_id: { type: 'string', description: 'Unique identifier for the delivery' },
            pickup_address: { type: 'string', description: 'Pickup address' },
            pickup_business_name: { type: 'string', description: 'Business name for pickup' },
            pickup_phone_number: { type: 'string', description: 'Phone number for pickup' },
            pickup_instructions: { type: 'string', description: 'Special instructions for pickup' },
            dropoff_address: { type: 'string', description: 'Dropoff address' },
            dropoff_business_name: { type: 'string', description: 'Business name for dropoff' },
            dropoff_phone_number: { type: 'string', description: 'Phone number for dropoff' },
            dropoff_instructions: { type: 'string', description: 'Special instructions for dropoff' },
            order_value: { type: 'number', description: 'Value of the order in cents' },
          },
          required: ['external_delivery_id', 'pickup_address', 'dropoff_address']
        }
      },
      {
        name: 'create_delivery',
        description: 'Create a new delivery request',
        inputSchema: {
          type: 'object',
          properties: {
            external_delivery_id: { type: 'string', description: 'Unique identifier for the delivery' },
            pickup_address: { type: 'string', description: 'Pickup address' },
            pickup_business_name: { type: 'string', description: 'Business name for pickup' },
            pickup_phone_number: { type: 'string', description: 'Phone number for pickup' },
            pickup_instructions: { type: 'string', description: 'Special instructions for pickup' },
            dropoff_address: { type: 'string', description: 'Dropoff address' },
            dropoff_business_name: { type: 'string', description: 'Business name for dropoff' },
            dropoff_phone_number: { type: 'string', description: 'Phone number for dropoff' },
            dropoff_instructions: { type: 'string', description: 'Special instructions for dropoff' },
            order_value: { type: 'number', description: 'Value of the order in cents' },
          },
          required: ['external_delivery_id', 'pickup_address', 'dropoff_address']
        }
      },
      {
        name: 'get_delivery',
        description: 'Get the status of an existing delivery',
        inputSchema: {
          type: 'object',
          properties: {
            external_delivery_id: { type: 'string', description: 'The delivery ID to retrieve' }
          },
          required: ['external_delivery_id']
        }
      },
      {
        name: 'cancel_delivery',
        description: 'Cancel an existing delivery',
        inputSchema: {
          type: 'object',
          properties: {
            external_delivery_id: { type: 'string', description: 'The delivery ID to cancel' }
          },
          required: ['external_delivery_id']
        }
      },
      {
        name: 'accept_delivery_quote',
        description: 'Accept a delivery quote and optionally add a tip',
        inputSchema: {
          type: 'object',
          properties: {
            external_delivery_id: { type: 'string', description: 'The delivery ID to accept' },
            tip: { type: 'number', description: 'The tip amount in cents (e.g. $5.99 = 599)' },
            dropoff_phone_number: { type: 'string', description: 'Phone number for Dasher to call for dropoff issues (E.164 format)' }
          },
          required: ['external_delivery_id']
        }
      },
      {
        name: 'update_delivery',
        description: 'Update delivery details such as addresses, times, or other parameters',
        inputSchema: {
          type: 'object',
          properties: {
            external_delivery_id: { type: 'string', description: 'The delivery ID to update' },
            pickup_address: { type: 'string', description: 'New pickup address' },
            pickup_business_name: { type: 'string', description: 'New pickup business name' },
            pickup_phone_number: { type: 'string', description: 'New pickup phone number' },
            pickup_instructions: { type: 'string', description: 'New pickup instructions' },
            dropoff_address: { type: 'string', description: 'New dropoff address' },
            dropoff_business_name: { type: 'string', description: 'New dropoff business name' },
            dropoff_phone_number: { type: 'string', description: 'New dropoff phone number' },
            dropoff_instructions: { type: 'string', description: 'New dropoff instructions' },
            dropoff_contact_given_name: { type: 'string', description: 'Dropoff contact first name' },
            dropoff_contact_family_name: { type: 'string', description: 'Dropoff contact last name' },
            contactless_dropoff: { type: 'boolean', description: 'Whether delivery should be contactless' },
            tip: { type: 'number', description: 'The tip amount in cents' },
            order_value: { type: 'number', description: 'Updated order value in cents' },
            pickup_time: { type: 'string', description: 'Preferred pickup time (ISO-8601 format)' },
            dropoff_time: { type: 'string', description: 'Preferred dropoff time (ISO-8601 format)' },
            dropoff_requires_signature: { type: 'boolean', description: 'Whether dropoff requires signature' },
            dropoff_cash_on_delivery: { type: 'number', description: 'Cash to collect on delivery in cents' }
          },
          required: ['external_delivery_id']
        }
      }
    ]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DoorDash MCP Server running on stdio');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

export { server, initializeDoorDashClient, __setDoorDashClient };
