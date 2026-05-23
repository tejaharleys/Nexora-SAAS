const { Resend } = require('resend');

const resend = new Resend('re_JF7uNTUT_MJmPyH7y7VP5fDa4qzvTonQ1');

async function test() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'admin@example.com',
      subject: 'Resend API Test',
      html: '<p>Testing Resend API Key</p>'
    });
    console.log("Result:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
