const express = require("express");
const router = express.Router();
const emailService = require("../services/emailService");
const he = require("he");
const { body, validationResult } = require("express-validator");

module.exports = () => {
	// Post contact form
	router.post(
		"/contact",
		[
			body("contact-first-name")
				.notEmpty()
				.withMessage("First name is required")
				.matches(/^[A-Za-z\s]+$/)
				.withMessage("First name should only contain letters and spaces"),
			body("contact-last-name")
				.notEmpty()
				.withMessage("Last name is required")
				.matches(/^[A-Za-z\s]+$/)
				.withMessage("Last name should only contain letters and spaces"),
			body("contact-id")
				.notEmpty()
				.withMessage("ID number is required")
				.isLength({ max: 8 })
				.withMessage("ID number should be less than or equal to 8 digits"),
			body("contact-email")
				.notEmpty()
				.withMessage("Email is required")
				.isEmail()
				.withMessage("Invalid email address"),
			body("contact-phone")
				.notEmpty()
				.withMessage("Phone number is required")
				.matches(/^\+595\d{9}$/)
				.withMessage("Invalid Paraguay phone number"),
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const errorMessages = errors
					.array()
					.map((error) => he.encode(error.msg));
				return res.status(400).send(`
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold">Error en el formulario de contacto:</span>
            <ul class="list-disc pl-5">
              ${errorMessages.map((msg) => `<li>${msg}</li>`).join("")}
            </ul>
          </div>
        `);
			}

			console.log("Received form data:", req.body);
			const {
				"contact-first-name": firstName,
				"contact-last-name": lastName,
				"contact-id": idNumber,
				"contact-email": email,
				"contact-phone": phone,
				"contact-message": message,
			} = req.body;

			try {
				await emailService.sendContactEmail({
					firstName: he.encode(firstName),
					lastName: he.encode(lastName),
					idNumber: he.encode(idNumber),
					email: he.encode(email),
					phone: he.encode(phone),
					message: he.encode(message),
				});

				res.send(`
					<div id="contact-and-location-component">
						<dialog class="modal modal-open" hx-ext="remove-me" remove-me="3s">
							<div class="modal-box text-center items-center">
								<h3 class="font-bold text-lg">Mensaje enviado</h3>
								<p class="py-4">Nuestros agentes se pondran en contacto.</p>
							</div>
						</dialog>
					</div>
				`);
			} catch (error) {
				console.error("Error handling contact form submission:", error);
				res.status(500).send(`
					<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
						<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
						<span class="font-bold text-center">Error submitting contact form. Please try again.</span>
					</div>
				`);
			}
		},
	);

	return router;
};
