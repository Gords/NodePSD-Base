const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const ses = new AWS.SES();

const sendVerificationEmail = async (email, token) => {
  const verificationLink = process.env.VERIFICATION_EMAIL_LINK + token;

  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Text: {
          Data: `Please click the following link to verify your account: ${verificationLink}`
        },
        Html: {
          Data: `<p>Please click the following link to verify your account:</p>
                 <a href="${verificationLink}">${verificationLink}</a>`
        }
      },
      Subject: {
        Data: 'Verify your FlashCenter account'
      }
    },
    Source: process.env.AWS_VERIFIED_EMAIL
  };

  try {
    await ses.sendEmail(params).promise();
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

const sendContactEmail = async (formData) => {
  const { firstName, lastName, idNumber, email, phone, message } = formData;

  const params = {
    Destination: {
      ToAddresses: [process.env.AWS_VERIFIED_EMAIL]
    },
    Message: {
      Body: {
        Text: {
          Data: `
            Nombre: ${firstName}
            Apellido: ${lastName}
            Nro. de Documento: ${idNumber}
            Email: ${email}
            Nro. de Telefono: ${phone}
            Mensaje: ${message}
          `
        },
        Html: {
          Data: `
            <p><strong>Nombre:</strong> ${firstName}</p>
            <p><strong>Apellido:</strong> ${lastName}</p>
            <p><strong>Nro. de Documento:</strong> ${idNumber}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Nro. de Telefono:</strong> ${phone}</p>
            <p><strong>Mensaje:</strong> ${message}</p>
          `
        }
      },
      Subject: {
        Data: 'Nueva solicitud de Credito'
      }
    },
    Source: process.env.AWS_VERIFIED_EMAIL
  };

  try {
    await ses.sendEmail(params).promise();
    console.log('Contact email sent successfully');
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw new Error('Failed to send contact email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendContactEmail
};
