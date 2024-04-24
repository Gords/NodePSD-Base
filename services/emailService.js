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

const sendContactEmail = async (formData) => {
  const { firstName, lastName, idNumber, email, phone, message } = formData;

  const mailOptions = {
    From: process.env.POSTMARK_SENDER_EMAIL,
    To: email,
    Subject: 'Nueva solicitud de Credito',
    TextBody: `
      Nombre: ${firstName}
      Apellido: ${lastName}
      Nro. de Documento: ${idNumber}
      Email: ${email}
      Nro. de Telefono: ${phone}
      Mensaje: ${message}
    `,
    HtmlBody: `
      <p><strong>Nombre:</strong> ${firstName}</p>
      <p><strong>Apellido:</strong> ${lastName}</p>
      <p><strong>Nro. de Documento:</strong> ${idNumber}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Nro. de Telefono:</strong> ${phone}</p>
      <p><strong>Mensaje:</strong> ${message}</p>
    `,
  };

  try {
    await client.sendEmail(mailOptions);
    console.log('Contact email sent successfully');
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw new Error('Failed to send contact email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendContactEmail,
};
