import chai from 'chai';
import JaelesApi from '../src/api';

const assert = chai.assert;

describe('Test login', () => {
  it('should correctly send login to jaeles and got incorrect password', async () => {
    const apiSender = new JaelesApi('http://localhost:3001');
    const resp = await apiSender.login('jaeles', 'something');
    assert(resp.code === 401);
    assert(resp.message === 'incorrect Username or Password');
  });

  it('should correctly send login to jaeles and get JWT token with correct password', async () => {
    const apiSender = new JaelesApi('http://localhost:3001');
    const resp = await apiSender.login('jaeles', '8bfaee12c8');
    assert(resp.code === 200);
  });
});

describe('Test ping', () => {
  it('should correctly send ping to jaeles and receive error because wrong jwt', async () => {
    const apiSender = new JaelesApi('http://localhost:3001');
    const resp = await apiSender.ping('something');
    assert(resp.code === 401);
  });

  it('should correctly send ping to jaeles and receive OK', async () => {
    const apiSender = new JaelesApi('http://localhost:3001');
    const resp = await apiSender.ping('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTQ5NDAxNzUsImlkIjoiYWRtaW4iLCJvcmlnX2lhdCI6MTY1MzY0NDE3NX0.JJf8RLK6zk5eZgTbdG9nPvV58NpnBxvdOCVgnUMGWSs');
    assert(resp.status === '200');
    assert(resp.message === 'pong');
  });
});
