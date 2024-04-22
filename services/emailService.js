const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailersend = new MailerSend({
	apiKey: process.env.MAILERSEND_API_KEY,
});

const sendVerificationEmail = async (email, token) => {
	const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

	const sentFrom = new Sender("MS_rmBngK@pocket.sh", "flashcenter");
	const recipients = [new Recipient(email)];

	const emailParams = new EmailParams()
		.setFrom(sentFrom)
		.setTo(recipients)
		.setSubject("Verifica tu cuenta de FlashCenter")
		.setHtml(`<p>Por favor haz click aqui para verificar tu cuenta:</p>
              <a href="${verificationLink}">${verificationLink}</a>`)
		.setText(
			`Por favor haz click aqui para verificar tu cuenta: ${verificationLink}`,
		);

	try {
		await mailersend.email.send(emailParams);
		console.log("Verification email sent successfully");
	} catch (error) {
		console.error("Error sending verification email:", error);
		throw new Error("Failed to send verification email");
	}
};

module.exports = {
	sendVerificationEmail,
};
