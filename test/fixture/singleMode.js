
const url = 'https://api.smsmode.com/http/1.6/sendSMS.do';
const token = '{{ token }}';
const message = 'Hi, here is your MFA code: ' + token;
const phoneNumber = '1234';

const authKey = '{{ authorization }}';
const authValue = 'api-key-123';

module.exports = {
  url,
  token,
  lettersToToken: message.indexOf(token),
  message,
  phoneNumber,
  authKey,
  authValue,
  config: {
    sms: {
      mode: 'single',
      token,
      variables: {
        [authKey]: authValue,
      },
      endpoints: {
        single: {
          url,
          method: 'POST',
        },
      },
    },
  },
  profile: { // will be stored under object "mfa"
    body: { // older - "content"
      message,
      phoneNumber,
    },
    query: {
      authorization: authKey,
    },
    headers: {
      authorization: authKey,
    },
  },
};
