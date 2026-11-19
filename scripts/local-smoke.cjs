const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { once } = require('node:events');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const { io } = require('../frontend/node_modules/socket.io-client');

const dbUrl = new URL(process.env.DB);
const baseUrl = new URL(process.env.BASE_URL);
assert.equal(dbUrl.protocol, 'mongodb:');
assert.equal(dbUrl.hostname, '127.0.0.1');
assert.equal(dbUrl.pathname, '/voip_smoke');
assert.equal(baseUrl.protocol, 'http:');
assert.equal(baseUrl.hostname, '127.0.0.1');
const origin = baseUrl.origin;
const post = async (route, body, headers = {}) => fetch(origin + '/api/' + route, {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const expect = async (response, status) => {
  assert.equal(response.status, status, await response.clone().text());
  return response;
};

async function main() {
  await mongoose.connect(process.env.DB);
  let r = await fetch(origin + '/api/users/');
  assert.equal((await r.json()).message, 'success');
  assert.equal(r.headers.get('cache-control'), 'no-store');
  await expect(await fetch(origin + '/'), 200);
  const password = 'local-smoke-password';
  const email = `local-smoke-${crypto.randomUUID()}@example.invalid`;
  await expect(await post('auth/register', {email, password}), 200);
  let login = await (await expect(await post('auth/login', {email, password}), 200)).json();
  assert.equal(login.status, 'true');
  const id = new mongoose.Types.ObjectId(login.data._id);
  const secret = speakeasy.generateSecret().base32;
  await mongoose.connection.collection('users').updateOne({_id: id}, {$set: {
    mfa: 'true', mfa_token: secret, password: bcrypt.hashSync(password, 6)
  }});
  const challenge = await (await expect(await post('auth/login', {email, password}), 200)).json();
  assert.equal(challenge.status, 'mfa');
  await expect(await post('auth/user/get', {}, {token: challenge.token}), 401);
  const code = speakeasy.totp({secret, encoding: 'base32'});
  login = await (await expect(await post('auth/otp-verify', {
    challenge: challenge.token, verification_code: code
  }), 200)).json();
  assert.equal(login.status, 'true');

  const upload = await fetch(origin + "/api/media/upload-files", {
    method: "POST", headers: { token: login.token }, body: new FormData(),
  });
  await expect(upload, 400);
  assert.equal((await upload.json()).message, "Provide one JPEG, PNG or GIF image");

  const unauthorized = io(origin, {transports: ['websocket'], reconnection: false});
  assert.match((await once(unauthorized, 'connect_error'))[0].message, /Unauthorized/);
  unauthorized.close();
  const client = io(origin, {transports: ['websocket'], auth: {token: login.token}, reconnection: false});
  await once(client, 'connect');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const number = `+1202555${String(crypto.randomInt(100, 200)).padStart(4, '0')}`;
  const from = '+12025550104';
  const setting = await mongoose.connection.collection('settings').insertOne({
    number, type: 'telnyx', user: id,
    telnyx_public_key: publicKey.export({format: 'der', type: 'spki'}).subarray(-32).toString('base64')
  });
  function sign(body) {
    const timestamp = String(Math.floor(Date.now()/1000));
    return {
      'telnyx-timestamp': timestamp,
      'telnyx-signature-ed25519': crypto.sign(null, Buffer.from(timestamp + '|' + body), privateKey).toString('base64')
    };
  }
  const inboundId = crypto.randomUUID();
  const outboundId = crypto.randomUUID();
  const inbound = JSON.stringify({data: {payload: {
    id: inboundId, from: {phone_number: from}, to: [{phone_number: number}],
    media: [], text: 'synthetic SMS'
  }}});
  const event = once(client, 'user_message');
  await expect(await post('setting/receive-sms/telnyx', inbound, sign(inbound)), 200);
  assert.equal((await event)[0].message, 'synthetic SMS');
  const messages = mongoose.connection.collection('messages');
  assert.equal((await messages.findOne({sid: inboundId})).user.toString(), id.toString());
  const list = await (await expect(await post('setting/sms-number-list', {
    setting: setting.insertedId
  }, {token: login.token}), 200)).json();
  assert.equal(list[0].message, 'synthetic SMS');

  await messages.insertOne({sid: outboundId, user: id, setting: setting.insertedId, type: 'send', status: 'sent'});
  const delivery = JSON.stringify({data: {payload: {
    id: outboundId, from: {phone_number: number}, to: [{phone_number: from, status: 'delivered'}]
  }}});
  await expect(await post('setting/sms-status/telnyx', delivery, sign(delivery)), 200);
  assert.equal((await messages.findOne({sid: outboundId})).status, 'delivered');
  client.close();
  await mongoose.disconnect();
  console.log('PASS HTTP, registration, login, TOTP, Socket.IO auth, signed Telnyx SMS and delivery status');
}
main().catch(error => { console.error(error); process.exit(1); });
