import chai from 'chai';
import { Jaeles } from '../src/index';

const assert = chai.assert;

describe('Test jaeles usage', () => {
  it('should correctly send request to jaeles server', async () => {
    const jaeles = new Jaeles({
      endpoint: 'http://localhost:8000',
      username: 'jaeles',
      password: '8bfaee12c8',
    });
    const t = await jaeles.sendRequest({
      method: 'POST',
      body: 'username=andeptrai&password=andeptrai',
      url: 'http://localhost:3456',
    });
  });
});
