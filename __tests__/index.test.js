import { initializeDoorDashClient, server, __setDoorDashClient } from '../index.js';
import { DoorDashClient } from '@doordash/sdk';
import { jest } from '@jest/globals';

describe('initializeDoorDashClient', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  test('returns null if env vars missing', () => {
    delete process.env.DOORDASH_DEVELOPER_ID;
    delete process.env.DOORDASH_KEY_ID;
    delete process.env.DOORDASH_SIGNING_SECRET;
    const result = initializeDoorDashClient();
    expect(result).toBeNull();
  });

  test('returns DoorDashClient when env vars set', () => {
    process.env.DOORDASH_DEVELOPER_ID = 'dev';
    process.env.DOORDASH_KEY_ID = 'key';
    process.env.DOORDASH_SIGNING_SECRET = 'secret';
    const result = initializeDoorDashClient();
    expect(result).toBeInstanceOf(DoorDashClient);
  });
});

describe('server handlers', () => {
  test('tools/list returns all tools', async () => {
    const handler = server._requestHandlers.get('tools/list');
    const result = await handler({ method: 'tools/list' });
    expect(result.tools.map(t => t.name)).toEqual([
      'create_delivery_quote',
      'create_delivery',
      'get_delivery',
      'cancel_delivery',
      'accept_delivery_quote',
      'update_delivery'
    ]);
  });

  test('unknown tool throws error', async () => {
    const handler = server._requestHandlers.get('tools/call');
    __setDoorDashClient({});
    await expect(
      handler({ method: 'tools/call', params: { name: 'bad', arguments: {} } })
    ).rejects.toThrow('Unknown tool');
    __setDoorDashClient(null);
  });

  test('create_delivery_quote forwards to client', async () => {
    const handler = server._requestHandlers.get('tools/call');
    const mockClient = { deliveryQuote: jest.fn().mockResolvedValue({ data: { ok: true } }) };
    __setDoorDashClient(mockClient);
    const result = await handler({ method: 'tools/call', params: { name: 'create_delivery_quote', arguments: { a: 1 } } });
    expect(mockClient.deliveryQuote).toHaveBeenCalledWith({ a: 1 });
    expect(JSON.parse(result.content[0].text)).toEqual({ ok: true });
    __setDoorDashClient(null);
  });
});
