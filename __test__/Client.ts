import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks()

import { Client } from '../src/index';

describe('Client', () => {
  let client: Client;

  beforeAll(() => {
    client = new Client('testtoken');
  });

  describe('/banlist', () => {
    it('getBan with valid ID', async () => {
      fetchMock.mockResponseOnce(async () => ({
        status: 200,
        body: JSON.stringify({
          id: 1,
          reason: 'bad bot',
          admin: 123,
          date: new Date(0),
          message: 'spam bot'
        }),
      }));
      expect(await client.getBan(1)).toMatchObject({ id: 1, reason: 'bad bot', message: 'spam bot' });
    });

    it('getBan with invalid ID', async () => {
      fetchMock.mockResponseOnce(async () => ({
        status: 404,
        body: JSON.stringify({
          code: 404,
          error: 'Not Found'
        })
      }));
      expect(await client.getBan(1)).toEqual(false);
    });
  })
});