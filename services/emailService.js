const AWS = require("aws-sdk");

const ses = new AWS.SES({
	region: process.env.AWS_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sendVerificationEmail = async (email, token) => {
	const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

	const params = {
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Body: {
				Html: {
					Charset: "UTF-8",
					Data: `<p>Please click the following link to verify your account:</p>
						    <a href="${verificationLink}">${verificationLink}</a>`,
				},
				Text: {
					Charset: "UTF-8",
					Data: `Please click the following link to verify your account: ${verificationLink}`,
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: "Verify your FlashCenter account",
			},
		},
		Source: process.env.AWS_VERIFIED_EMAIL,
	};

	try {
		await ses.sendEmail(params).promise();
		console.log("Verification email sent successfully");
	} catch (error) {
		console.error("Error sending verification email:", error);
		throw new Error("Failed to send verification email");
	}
};

module.exports = {
	sendVerificationEmail,
};
