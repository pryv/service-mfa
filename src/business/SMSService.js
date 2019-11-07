// @flow

const request = require('superagent');

class SMSService {

  auth: string;
  endpointSend: string;
  endpointVerify: string;

  constructor(settings: Object) {
    this.auth = settings.get('sms:auth');
    this.endpointSend = settings.get('sms:endpoints:send');
    this.endpointVerify = settings.get('sms:endpoints:send');
  }

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await request
      .post(this.endpointVerify)
      .set('Authorization', `Bearer ${this.auth}`)
      .send({
        phone_number: phoneNumber,
        code: code,
      });
    return verification.ok;
  }

  async challenge(phoneNumber: string): Promise<string> {
    const res = await request
      .post(this.endpointSend)
      .set('Authorization', `Bearer ${this.auth}`)
      .send({
        phone_number: phoneNumber
      });
    return res.body.id;
  }
}

module.exports = SMSService;
