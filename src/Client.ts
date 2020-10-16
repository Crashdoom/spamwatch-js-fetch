import { BadRequestError, ForbiddenError, NotFoundError, ServerError, TooManyRequestsError, UnauthorizedError } from './Errors';
import { Ban } from './models';

export class Client {
  private host: string;
  private token: string;

  constructor(token: string, host = 'https://api.spamwat.ch') {
    this.host = host;
    this.token = token;
  }

  /**
   * Check for a ban
   * @param userId ID of the user
   * @returns {Ban|false} Ban object or false if not found
   */
  public async getBan(userId: number): Promise<Ban | false> {
    try {
      return this._makeRequest<Ban>(`banlist/${userId}`);
    } catch (e) {
      if (e instanceof NotFoundError) {
        return false;
      }

      throw e;
    }
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

    const json = await response.clone().json();

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