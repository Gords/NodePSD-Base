const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: process.env.AWS_REGION });

const sendVerificationEmail = async (email, token) => {
	const verificationLink = process.env.VERIFICATION_EMAIL_LINK + token;

	const params = {
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Body: {
				Text: {
					Data: `Por favor, haga clic en el enlace para verificar su cuenta: ${verificationLink}`,
				},
				Html: {
					Data: `<p>Por favor, haga clic en el enlace para verificar su cuenta:</p>
                 <a href="${verificationLink}">${verificationLink}</a>`,
				},
			},
			Subject: {
				Data: "Verifique su cuenta de FlashCenter",
			},
		},
		Source: process.env.AWS_VERIFIED_EMAIL,
	};

	try {
		await ses.send(new SendEmailCommand(params));
		console.log("Verification email sent successfully");
	} catch (error) {
		console.error("Error sending verification email:", error);
		throw new Error("Failed to send verification email");
	}
};

const sendContactEmail = async (formData) => {
	const { firstName, lastName, idNumber, email, phone, message } = formData;

	const params = {
		Destination: {
			ToAddresses: [process.env.AWS_VERIFIED_EMAIL],
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
          `,
				},
				Html: {
					Data: `
            <p><strong>Nombre:</strong> ${firstName}</p>
            <p><strong>Apellido:</strong> ${lastName}</p>
            <p><strong>Nro. de Documento:</strong> ${idNumber}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Nro. de Telefono:</strong> ${phone}</p>
            <p><strong>Mensaje:</strong> ${message}</p>
          `,
				},
			},
			Subject: {
				Data: "Nueva solicitud de Credito",
			},
		},
		Source: process.env.AWS_VERIFIED_EMAIL,
	};

	try {
		await ses.send(new SendEmailCommand(params));
		console.log("Contact email sent successfully");
	} catch (error) {
		console.error("Error sending contact email:", error);
		throw new Error("Failed to send contact email");
	}
};

const sendPasswordResetEmail = async (email, token) => {
	const resetLink = `${process.env.PASSWORD_RESET_LINK}?token=${token}`;

	const params = {
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Body: {
				Text: {
					Data: `Por favor, haga clic en el enlace para restablecer su contraseña: ${resetLink}`,
				},
				Html: {
					Data: `<p>Por favor, haga clic en el enlace para restablecer su contraseña:</p> <a href="${resetLink}">${resetLink}</a>`,
				},
			},
			Subject: {
				Data: "Restablezca su contraseña de FlashCenter",
			},
		},
		Source: process.env.AWS_VERIFIED_EMAIL,
	};

	try {
		await ses.send(new SendEmailCommand(params));
		console.log("Password reset email sent successfully");
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw new Error("Failed to send password reset email");
	}
};

const sendLoanRequestEmail = async (userEmail) => {
	const loanRequestEmail = process.env.LOAN_REQUEST_EMAIL;
  
	const params = {
	  Destination: {
		ToAddresses: [loanRequestEmail],
	  },
	  Message: {
		Body: {
		  Text: {
			Data: `El usuario ${userEmail} ha solicitado una prestamo.`,
		  },
		  Html: {
			Data: `<p>El usuario ${userEmail} ha solicitado un prestamo.</p>`,
		  },
		},
		Subject: {
		  Data: "Solicitud de Prestamo",
		},
	  },
	  Source: process.env.AWS_VERIFIED_EMAIL,
	};
  
	try {
	  await ses.send(new SendEmailCommand(params));
	  console.log("Loan request email sent successfully");
	} catch (error) {
	  console.error("Error sending loan request email:", error);
	  throw new Error("Failed to send loan request email");
	}
  };
  

module.exports = {
	sendVerificationEmail,
	sendContactEmail,
	sendPasswordResetEmail,
	sendLoanRequestEmail,
};
