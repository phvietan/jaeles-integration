import { JaelesApi } from './api';
import { Session } from './session';
import { JaelesOptions } from './session';
import { AxiosRequest, requestToBurp } from 'axios-burp';

export { JaelesOptions };

/**
 * @type
 */
export type AxiosResponse = {
  headers: string[];
  body: string;
}

export type JaelesRequestOption = {
  burp: string;
}

/**
 * Convert string utf-8 to base64
 *
 * @function
 * @param {string} s - Input utf-8 string to be converted
 * @return {string} Base64 version of string
 */
function base64(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64');
}

/**
 * Main Jaeles class to communicate with Jaeles server
 *
 * @class
 */
export class Jaeles {
  session: Session;
  api: JaelesApi;

  /**
   * Create Jaeles instance to communicate with Jaeles server
   *
   * @constructor
   * @param {JaelesOptions} opts - Options include: Jaeles endpoint, Jaeles JWT token, Jaeles username, Jaeles password
   */
  constructor(opts: Partial<JaelesOptions>) {
    opts.endpoint = opts.endpoint || 'http://127.0.0.1:5000';
    opts.token = opts.token || '';
    opts.username = opts.username || '';
    opts.password = opts.password || '';
    this.session = new Session(opts as JaelesOptions);
    this.api = new JaelesApi(opts.endpoint);
  }

  /**
   * Parse response to base64
   *
   * @function
   * @param {string | AxiosRequest} response - Response that will be sent to Jaeles server
   * @return {string} Base64 string of response
   */
  #parseResponseBase64(response: string | AxiosResponse): string {
    if (typeof response === 'string') return base64(response);
    const joinedHeaders = response.headers.reduce((prev, cur) => prev + cur + '\r\n', '');
    return base64(joinedHeaders + '\r\n' + response.body);
  }

  /**
   * Parse request to base64
   *
   * @function
   * @param {string | AxiosRequest} request - Request that will be sent to Jaeles server
   * @return {string} Base64 string of request
   */
  #parseRequestBase64(request: string | AxiosRequest): string {
    const s = (typeof request !== 'string') ? requestToBurp(request, true) : request;
    console.log(s);
    return base64(s);
  }

  /**
   * Send request to Jaeles API server
   *
   * @function
   * @param {string | AxiosRequest} request - Request that will be sent to Jaeles server, could be in string format or in object format
   * @param {string?} url - URL of the target server, if request is in string format URL MUST BE presented
   */
  async sendRequest(request: string | AxiosRequest, url?: string) {
    if (!url) {
      if (typeof request === 'string') throw new Error('Must specify target server URL because request is in string format');
      url = request.url;
    }
    const reqB64 = this.#parseRequestBase64(request);
    const jwt = await this.session.getSession();
    return this.api.sendReqRes(jwt, reqB64, '', url);
  }

  /**
   * Send request/response to Jaeles API server
   *
   * @function
   * @param {string | AxiosRequest} request - Request that will be sent to Jaeles server, could be in string format or in object format
   * @param {string | AxiosRequest} response - Response that will be sent to Jaeles server, could be in string format or in object format
   * @param {string?} url - URL of the target server, if request is in string format URL MUST BE presented
   */
  async sendRequestResponse(request: string | AxiosRequest, response: string | AxiosResponse, url?: string) {
    if (!url) {
      if (typeof request === 'string') throw new Error('Must specify target server URL because request is in string format');
      url = request.url;
    }
    const reqB64 = this.#parseRequestBase64(request);
    const resB64 = this.#parseResponseBase64(response);
    const jwt = await this.session.getSession();
    return this.api.sendReqRes(jwt, reqB64, resB64, url);
  }
}
