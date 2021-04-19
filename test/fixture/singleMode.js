const qs = require('querystring');

const url = 'https://api.smsmode.com/http/1.6/sendSMS.do';
const code = '{{ code }}';
const message = 'Hi, here is your MFA code: ' + code;
const messageWithCode = (replace) => message.replace(code, replace);
const lettersToToken = message.indexOf(code)
const extractCodeFromBody = (body) => body.message.substring(lettersToToken);
const phoneNumber = '1234';

const authValue = 'api-key-123';
const query = `phoneNumber={{ phoneNumber }}&auth=${authValue}`;
const headers = { 
  authorization: authValue,
  'content-type': 'application/json',
};
const body = {phoneNumber: '{{ phoneNumber }}', message: '{{ message }}'};

module.exports = {
  url: `${url}?${query}`,
  code,
  message,
  messageWithCode,
  bodyWithCode: (code) => { return { phoneNumber, message: messageWithCode(code) }; },
  extractCodeFromBody,
  phoneNumber,
  authValue,
  headers,
  query: qs.parse(query.replace('{{ phoneNumber }}', '1234')),
  config: {
    sms: {
      mode: 'single',
      endpoints: {
        single: {
          url: `${url}?${query}`,
          method: 'POST',
          body: JSON.stringify(body),
          headers,
        },
      },
    },
  },
  profile: {
    phoneNumber,
    message,
  },
};
