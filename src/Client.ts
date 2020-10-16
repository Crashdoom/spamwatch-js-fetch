import { BadRequestError, ForbiddenError, NotFoundError, ServerError, TooManyRequestsError, UnauthorizedError } from './Errors';
import { AddBan, Ban, Stats, Version } from './models';

export class Client {
  private host: string;
  private token: string;

  constructor(token: string, host = 'https://api.spamwat.ch') {
    this.host = host;
    this.token = token;
  }

  /**
   * Retrieves the current Spamwatch API version
   * @returns {Version} Version of the API
   */
  public async getVersion(): Promise<Version> {
    return this._makeRequest<Version>('version');
  }

  /**
   * Retrieves some basic statistics
   * @returns {Stats}
   */
  public async getStats(): Promise<Stats> {
    return this._makeRequest<Stats>('stats');
  }

  /**
   * Adds a new ban to Spamwatch
   * Requires ADMIN permission.
   * @param banInfo user ID and ban reason
   */
  public async addBan(banInfo: AddBan): Promise<void> {
    return this._makeRequest('banlist', 'POST', banInfo);
  }

  /**
   * Removes a ban for a user
   * Requires ADMIN permission.
   * @param userId user ID to unban
   */
  public async deleteBan(userId: number): Promise<void> {
    return this._makeRequest(`banlist/${userId}`, 'DELETE');
  }

  /**
   * Check for a ban
   * @param userId ID of the user
   * @returns {Ban|false} Ban object or false if not found
   */
  public async getBan(userId: number): Promise<Ban | false> {
    try {
      return await this._makeRequest<Ban>(`banlist/${userId}`);
    } catch (e) {
      if (e instanceof NotFoundError) {
        return false;
      }

      throw e;
    }
  }

  /**
   * Retrieve a list of all banned user IDs
   * @returns {number[]} Array of Telegram user IDs
   */
  public async getBanIds(): Promise<number[]> {
    return this._makeRequest<number[]>('banlist/all');
  }

  /**
   * Retrieve a list of all banned user records.
   * Requires ROOT permission.
   * @returns {Ban[]} Array of Ban
   */
  public async getBans(): Promise<Ban[]> {
    return this._makeRequest<Ban[]>('banlist');
  }

  private async _makeRequest<T>(path: string, method = 'GET', kwargs = {}): Promise<T> {
    const response = await fetch(
      `${this.host}/${path}`,
      {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        ...kwargs,
      },
    );

    const json = (await response.clone().json()) || {};

    switch (response.status) {
      default:
        return json as T;

      case 400:
        throw new BadRequestError(response, json);

      case 401:
        throw new UnauthorizedError(response, 'Invalid token');

      case 403:
        throw new ForbiddenError(response, this.token);

      case 404:
        throw new NotFoundError(response);

      case 429:
        throw new TooManyRequestsError(response, json);

      case 500:
        throw new ServerError(response, 'api.spamwat.ch Internal Server Error');
    }
  }
}