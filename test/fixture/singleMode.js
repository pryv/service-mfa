
const singleUrl = 'https://api.smsmode.com/http/1.6/sendSMS.do';
const token = '{{ token }}';
const singleMessage = 'Hi, here is your MFA code: ' + token;

module.exports = {
  singleUrl,
  singleToken: token,
  lettersToToken: singleMessage.indexOf(token),
  singleConfig: {
    sms: {
      mode: 'single',
      endpoints: {
        single: {
          url: singleUrl,
          method: 'POST',
          headers: {
            authorization: 'api-key-123',
            other: 'something',
          },
        }
      },
      token,
    }
  },
  singleMessage,
}