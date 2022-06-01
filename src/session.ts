import { JaelesApi } from './api';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

export type SessionOptions = {
  endpoint: string;
  token?: string;
  username: string;
  password: string;
}

const SESSION_FILENAME = path.join(__dirname, '.session.json');

/**
 * Session class to maintain session connection with Jaeles Server
 *
 * @class
 */
export class Session {
  api: JaelesApi;

  /**
   * Create Session instance to store session of Jaeles Server
   *
   * @constructor
   * @param {SessionOptions} opts - Options include: Jaeles endpoint, Jaeles JWT token, Jaeles username / password
   */
  constructor(opts: SessionOptions) {
    if (!fs.existsSync(SESSION_FILENAME)) {
      fs.writeFileSync(SESSION_FILENAME, JSON.stringify(opts));
    } else {
      const sess = {
        ...fs.readFileSync(SESSION_FILENAME),
        ...opts,
      };
      fs.writeFileSync(SESSION_FILENAME, JSON.stringify(sess));
    }
    this.api = new JaelesApi(opts.endpoint);
  }

  /**
   * Ping Jaeles server to check if JWT token is usable
   *
   * @function
   * @param {string} token - The JWT token to be checked
   */
  async #checkUsableToken(token: string) {
    const resp = await this.api.ping(token);
    return resp.code !== 401;
  }

  /**
   * Get new JWT token by login with username / password
   *
   * @function
   * @param {string} username - Username to login
   * @param {string} password - Password to login
   */
  async #getNewToken(username: string, password: string) {
    const resp = await this.api.login(username, password);
    const { token } = resp;
    return token;
  }

  /**
   * Return the usable JWT
   *
   * @function
   * @param {SessionOptions} sessionOpts - The session options if you want to override the default session
   */
  async getSession(sessionOpts?: SessionOptions): Promise<string> {
    const opts = {
      ...JSON.parse(await fsPromise.readFile(SESSION_FILENAME, 'utf-8')) as SessionOptions,
      ...(sessionOpts || {}),
    };
    let { token } = opts;
    if (!token || !(await this.#checkUsableToken(token))) {
      token = await this.#getNewToken(opts.username, opts.password);
    }
    opts.token = token;
    await fsPromise.writeFile(SESSION_FILENAME, JSON.stringify(opts));
    return token as string;
  }
}
