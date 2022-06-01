import axios from 'axios';

const jaelesInstance = axios.create({
  validateStatus: () => true,
  // proxy: {
  //   'host': 'localhost',
  //   'port': 8080,
  // },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * JaelesApi class to communicate with Jaeles API server
 *
 * @class
 */
export class JaelesApi {
  endpoint: string;

  /**
   * Constructor to create JaelesApi instance
   *
   * @constructor
   * @param {string} endpoint - URL endpoint that is hosting Jaeles API server
   */
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Attempt to login to Jaeles
   *
   * @function
   * @param {string} username - The username to login
   * @param {string} password - The password to login, it should be located in `~/.jaeles/burp.json`
   */
  async login(username: string, password: string) {
    const resp = await jaelesInstance.post(`${this.endpoint}/auth/login`, { username, password });
    return resp.data;
  }

  /**
   * Ping Jaeles to check authorization
   *
   * @function
   * @param {string} jwt - JWT token to authorize with Jaeles API
   */
  async ping(jwt: string) {
    const resp = await jaelesInstance.get(`${this.endpoint}/api/ping`, {
      headers: { 'Authorization': `Jaeles ${jwt}` },
    });
    return resp.data;
  }

  /**
   * Attempt to send request/response to Jaeles
   *
   * @function
   * @param {string} jwt - JWT token to authorize with Jaeles API
   * @param {string} req - Base64 of request
   * @param {string} res - Base64 of response
   * @param {string} url - The URL for Jaeles to fuzz
   */
  async sendReqRes(jwt: string, req: string, res: string, url: string) {
    const resp = await jaelesInstance.post(`${this.endpoint}/api/parse`, { req, res, url }, {
      headers: { 'Authorization': `Jaeles ${jwt}` },
    });
    return resp.data;
  }
}
