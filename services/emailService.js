const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
    From: process.env.POSTMARK_SENDER_EMAIL,
    To: email,
    Subject: 'Verify your FlashCenter account',
    TextBody: `Please click the following link to verify your account: ${verificationLink}`,
    HtmlBody: `<p>Please click the following link to verify your account:</p>
               <a href="${verificationLink}">${verificationLink}</a>`,
  };

  try {
    await client.sendEmail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendVerificationEmail,
};
