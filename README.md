# What is Jaeles

[Jaeles](https://github.com/jaeles-project/jaeles) has done a good job and became one of the most popular fuzzing tool for bug hunters. The tool got mentioned in [Nahamsec talk](https://youtu.be/HmDY7w8AbR4?t=1282) and reached over 1k stars.

Kudos for them 💗!!!

# Jaeles integration

`jaeles-integration` is a NodeJS library for sending jaeles compatible requests to Jaeles server. This library is meant for bug hunters to write tools and automate their web fuzzing workflow.

# Installation

Install with npm

```sh
npm i jaeles-integration --save
```

Install with yarn

```sh
yarn add jaeles-integration
```

# Usage

Before using this library, please spin up your own jaeles server via [this tutorial](https://github.com/jaeles-project/jaeles).

First let's understand the configuration option to use `jaeles-integration`.

## type: JaelesOptions

```typescript
type JaelesOptions = {
  endpoint?: string;
  token?: string;
  username?: string;
  password?: string;
}
```

| Property        | Description               | Type  |
| :------------- |:-------------:             | :-----:|
| endpoint       | The endpoint of Jaeles server (Default "http://127.0.0.1:5000")  | string |
| token    | The JWT token to connect to Jaeles Server (Default "") | string |
| username        |  The username of Jaeles Server (Default "")     |  string |
| password        |  The password of Jaeles Server (Default "")    |  string |

<br>

## class: Jaeles

To create Jaeles instance:

```typescript
const Jaeles = require('jaeles-integration');
const jaeles = new Jaeles();
```

### constructor([ opts: Partial\<JaelesOptions\> ])

Constructor function to initialize the Jaeles instance.

You can specify any property in `JaelesOptions` or not, because every property is optional. For example if you create Jaeles server at `http://yourown.server.com:7998` without authentication, you can create Jaeles instance with:

```typescript
const Jaeles = require('jaeles-integration');
const jaeles = new Jaeles({
  endpoint: "http://yourown.server.com:7998",
  // No need to specify username / password or token
});
```

### Jaeles.sendRequest(req: string | AxiosRequest[, url: string])

Call `sendRequest` to send a single request to Jaeles Server using string format or `AxiosRequest` format.

#### # String-formatted payload

When sending request using string format, you must specify the target URL.

```typescript
const Jaeles = require('jaeles-integration');

async function send() {
  const payload = `
POST /path HTTP/1.1
Host: target_server.com
Connection: close
Content-Length: 21
Cache-Control: max-age=0
Origin: https://target_server.com
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36

user=admin&pass=admin
  `.trim();

  const jaeles = new Jaeles({ endpoint: "http://yourown.server.com:7998" });
  await jaeles.sendRequest(payload, "https://target_server.com/some/path?with_param");
}
```

Note: it is up to Jaeles server to use https://target_server.com/some/path?with_param
or use /path that we send in our `payload`. `jaeles-integration` only serve as the sender.

#### # AxiosRequest-formatted payload

We named it `AxiosRequest` because we really like [Axios](https://github.com/axios/axios).

`AxiosRequest` format is defined as folow:

```typescript
interface AxiosRequest {
  url: string;
  httpVersion?: string;
  method?: HttpMethod;
  headers?: Record<string, string | number | boolean>;
  body?: string;
}
```

| Property        | Description                          | Type  | Required
| :------------- |:---------------------------------:    | :-----:| :-----:|
| url            | The full url of the target server     | string | ✔️ |
| httpVersion    | The http version (Default "HTTP/1.1") | string |    |
| method         | The http method (Default "GET")       |  string |  |
| headers        | The http headers (Default {})         |  Record<string, any> |  |
| body           |  The http body (Default "")           |   string |     |

```typescript
const Jaeles = require('jaeles-integration');

async function send() {
  const payload = {
    url: "http://target_server.com/some/path?oops=1",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer something",
    },
    body: "somebodyhere"
  }

  const jaeles = new Jaeles({ endpoint: "http://yourown.server.com:7998" });
  await jaeles.sendRequest(payload);
  // or await jaeles.sendRequest(payload, "http://target_server.com/some_url");
}
```

### Jaeles.sendRequestResponse(req: string | AxiosRequest, res: string | AxiosResponse[, url: string])

Internally, when we also specify the Response object to Jaeles server, it will use our Response object without trying to issue the initialize request of the fuzzer.

Specify the response object helps Jaeles to be stealthier.

Response object can be presented using 2 different format:

### # String-formatted Response

```typescript
const Jaeles = require('jaeles-integration');

async function send() {
  const payload = { url: "http://target_server.com" }
  const resp = `
HTTP/1.1 200 OK
Date: Wed, 01 Jun 2022 10:20:23 GMT
Content-Type: text/html; charset=utf-8
Connection: close
Vary: *, Accept-Encoding
X-Frame-Options: SAMEORIGIN
Access-Control-Allow-Origin: *
CF-Cache-Status: HIT
Age: 490
Server: cloudflare
CF-RAY: 714737658c666bb1-SIN
Content-Length: 12

somebodyhere
`.trim();

  const jaeles = new Jaeles({ endpoint: "http://yourown.server.com:7998" });
  await jaeles.sendRequestResponse(payload, resp);
  // or await jaeles.sendRequestResponse(payload, resp, "http://target_server.com/some_url");
}
```

### # AxiosResponse-formatted

`AxiosResponse` is defined as:

```typescript
type AxiosResponse = {
  headers: string[];
  body: string;
}
```

```typescript
const Jaeles = require('jaeles-integration');

async function send() {
  const payload = { url: "http://target_server.com" }
  const resp = {
    headers: [
      'HTTP/1.1 200 OK',
      'Date: Wed, 01 Jun 2022 10:20:23 GMT',
      'Content-Type: text/html; charset=utf-8',
      'Connection: close',
      'Vary: *, Accept-Encoding',
      'X-Frame-Options: SAMEORIGIN',
      'Access-Control-Allow-Origin: *',
      'CF-Cache-Status: HIT',
      'Age: 490',
      'Server: cloudflare',
      'CF-RAY: 714737658c666bb1-SIN',
      'Content-Length: 12',
    ],
    body: 'somebodyhere',
  }

  const jaeles = new Jaeles({ endpoint: "http://yourown.server.com:7998" });
  await jaeles.sendRequestResponse(payload, resp);
  // or await jaeles.sendRequestResponse(payload, resp, "http://target_server.com/some_url");
}
```

# License

The project is released under the [MIT license](./LICENSE).
