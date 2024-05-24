const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const he = require("he");
const { isAuthenticated, isAdmin } = require("../services/authService");
const path = require("node:path");

module.exports = (User) => {
	// User registration
	router.post(
		"/auth/register",
		[
			body("email")
				.isEmail()
				.withMessage("Dirección de correo electrónico no válida"),
			body("password")
				.isLength({ min: 6 })
				.withMessage("La contraseña debe tener al menos 6 caracteres"),
			body("name")
				.matches(/^[A-Za-z\s]+$/)
				.withMessage("El nombre solo debe contener letras y espacios"),
			body("lastName")
				.matches(/^[A-Za-z\s]+$/)
				.withMessage("El apellido solo debe contener letras y espacios"),
			body("idNumber")
				.isLength({ min: 6, max: 8 })
				.withMessage("El número de cédula debe tener entre 6 y 8 dígitos"),
			body("phoneNumber")
				.matches(/^\+595\d{9}$/)
				.withMessage("Número de teléfono de Paraguay no válido"),
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const errorMessages = errors.array().map((error) => error.msg);

				// Error response for invalid input in user registration
				return res.status(500).send(`
					<div id="register-form-component">
						<div role="alert" class="alert alert-error border-black border-2 flex items-center">
							<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-8 h-8 inline-block">
							<div class="flex-grow text-center">
								<ul class="pl-5 font-semibold">
									${errorMessages.map((msg) => `<li>${msg}</li>`).join("")}
								</ul>
							</div>
						</div>
					</div>
				`);
			}

			try {
				const { email, password, name, lastName, idNumber, phoneNumber } =
					req.body;
				const hashedPassword = await bcrypt.hash(password, 10);
				const user = await User.create({
					email: he.encode(email),
					password: hashedPassword,
					name: he.encode(name),
					lastName: he.encode(lastName),
					idNumber: he.encode(idNumber),
					phoneNumber: he.encode(phoneNumber),
					isVerified: false,
				});

				// Generate verification token
				const verificationToken = jwt.sign(
					{ userId: user.id },
					process.env.JWT_SECRET,
					{ expiresIn: "1h" },
				);

				// Send verification email
				await emailService.sendVerificationEmail(email, verificationToken);
				console.log("User registered successfully:", user.email);

				// Registration success modal
				res.status(200).send(`
					<div id="register-form-component">
						<dialog class="modal modal-open success">
							<div class="modal-box bg-success border-2 border-black text-center items-center">
								<h3 class="font-bold text-lg">Registro de usuario exitoso!</h3>
								<p class="py-4">Verifica tu correo electrónico para activar tu cuenta.<br><br>Redireccionando a la pagina principal...</p>
							</div>
						</dialog>
					</div>
				`);
			} catch (error) {
				console.error("Error registering user:", error);
				if (error.name === "SequelizeUniqueConstraintError") {
					// Handle unique constraint violation error
					res.status(400).send(
						`
						<div id="register-form-component">
							<div role="alert" class="alert alert-error border-black border-2 flex items-center">
								<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
								<div class="flex-grow text-center">
									<p class="font-semibold">El correo electrónico ya está registrado.<br>Por favor utiliza otro correo electrónico.</p>
								</div>
							</div>
						</div>
				`.trim(),
					);
				} else {
					// Error response for failed user registration (e.g. email already exists)
					res.status(500).send(
						`
						<div id="register-form-component">
							<div role="alert" class="alert alert-error border-black border-2 mb-2 mx-4 max-w-fit">
								<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
								<p class="font-semibold">Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.</p>
							</div>
						</div>
					`.trim(),
					);
				}
			}
		},
	);

	// Verify email
	router.get("/auth/email", async (req, res) => {
		const { token } = req.query;


		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.userId;

			const user = await User.findByPk(userId);
			if (!user) {
				return res.status(400).json({ error: "Invalid verification token" });
			}

			user.isVerified = true;
			await user.save();

			// Encode the succesful verification modal and pass it in the redirect URL
			const successHtml = encodeURIComponent(`
				<div id="register-response">
					<dialog id="modal-verification-response" class="modal modal-open auth-success">
						<div class="modal-box bg-success border-2 border-black text-center items-center">
							<h3 class="font-bold text-lg">Verificacion de cuenta exitosa!</h3>
							<p class="py-4">Por favor inicia sesion para acceder a nuestros servicios.</p>
						</div>
					</dialog>
				</div>
			`);

			res.redirect(`/?message=${successHtml}`);
		} catch (error) {
			console.error("Error verifying email:", error);

			// TODO: Implement error response for invalid verification token. Ask Nando if we should approach this the same as success response above (i.e. use a modal with a message and redirect to homepage)
			res.status(400).send(`
				<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
					<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
					<span class="font-bold justify-center">Invalid verification token</span>
				</div>
			`);
		}
	});

	// User login
	router.post(
		"/auth/login",
		[
			body("username").isEmail().withMessage("Invalid email address"),
			body("password").notEmpty().withMessage("Password is required"),
		],
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const errorMessages = errors.array().map((error) => error.msg);

				// TODO: Remove unnecessary login-responses
				return res.status(400).send(`
					<div id="loginResponse">
						<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
							<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
							<span class="font-bold">Error en el inicio de sesión:</span>
							<ul class="list-disc pl-5">
							${errorMessages.map((msg) => `<li>${msg}</li>`).join("")}
							</ul>
						</div>
					</div>
				`);
			}

			// TODO: only login response that gets triggered at the moment
			passport.authenticate("local", (err, user, info) => {
				if (err) {
					return res.status(500).send(`
						<div id="login-form-component">
							<div role="alert" class="alert alert-warning border-black border-2 flex items-center">
								<img src="./assets/icons/warning.svg" alt="Warning Symbol" class="w-6 h-6 pl-4 inline-block">
								<div class="flex-grow text-center">
									<p class="font-semibold">Usuario o contraseña incorrecto. <br> Por favor intenta de nuevo</p>
								</div>
							</div>
						</div>
					`);
				}

				if (!user) {
					return res.status(401).send(`
						<div id="loginResponse">
							<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
								<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
								<span class="font-bold text-center">${
									info.message || "Ese usuario no existe"
								}</span>
							</div>
						</div>
					`);
				}

				req.logIn(user, (loginErr) => {
					if (loginErr) {
						return res.status(500).send(`
							<div id="loginResponse">
								<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
									<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
									<span class="font-bold text-center">500 i see u not</span>
								</div>
							</div>
						`);
					}

					if (!user.isVerified) {
						return res.status(401).send(`
							<div id="loginResponse">
								<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
									<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
									<span class="font-bold text-center">Por favor verifica tu correo electrónico</span>
								</div>
							</div>
						`);
					}

					// Set the appropriate redirect URL based on user role
					const redirectUrl = user.isAdmin
						? "/admin-panel.html"
						: "/user-panel.html";
					res.header("HX-Redirect", redirectUrl);
					return res.send(`
						<div id="loginResponse">
							<div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
								<img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
								<span class="font-bold">Inicio de sesión exitoso</span>
							</div>
						</div>
					`);
				});
			})(req, res, next);
		},
	);

	// User logout
	router.post("/auth/logout", (req, res) => {
		req.logout((err) => {
			if (err) {
				console.error("Error logging out:", err);
				return res.status(500).send(`
					<div id="logoutResponse">
						<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
							<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
							<span class="font-bold text-center">Ocurrió un error durante el proceso de cierre de sesión</span>
						</div>
					</div>
				`);
			}
			res.header("HX-Redirect", "/");
			res.sendStatus(200);
		});
	});

	// Password reset request
	router.post("/auth/forgot-password", 		[
		body("username").isEmail().withMessage("Invalid email address"),
		body("password").notEmpty().withMessage("Password is required"),
	],async (req, res) => {
		let email = req.body.username;
		email = he.decode(email);


		if (!email) {
			return res.status(400).send(`
				<div id="login-form-component">
					<div role="alert" class="alert alert-error border-black border-2 flex items-center">
						<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
						<div class="flex-grow text-center">
							<p class="font-semibold">Por favor ingresa un email valido.</p>
						</div>
					</div>
				</div>
			`);
		}

		try {
			let user = await User.findOne({ where: { email } });
			user = he.decode(user);
			if (!user) {
				return res.status(404).send(`
				<div id="login-form-component">
					<div role="alert" class="alert alert-error border-black border-2 flex items-center">
						<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
						<div class="flex-grow text-center">
							<p class="font-semibold">El usuario ingresado no existe</p>
						</div>
					</div>
				</div>
				`);
			}

			// Generate password reset token
			const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			// Send password reset email
			await emailService.sendPasswordResetEmail(email, resetToken);

			res.send(`
				<div id="login-form-component">
					<dialog class="modal modal-open success" hx-ext="remove-me" remove-me="6s">
						<div class="modal-box bg-success border-2 border-black text-center items-center">
							<h3 class="font-bold text-lg">Correo de restablecimiento de contraseña enviado!</h3>
							<p class="py-4">Por favor revisa tu correo electrónico para el enlace de restablecimiento.</p>
						</div>
					</dialog>
				</div>
			`);
		} catch (error) {
			console.error("Error sending password reset email:", error);
			res.status(500).send(`
				<div id="login-form-component">
					<div role="alert" class="alert alert-error border-black border-2 flex items-center">
						<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
						<div class="flex-grow text-center">
							<p class="font-semibold">No pudimos enviar el correo de restablecimiento de contraseña. Por favor intenta de nuevo.</p>
						</div>
					</div>
				</div>
			`);
		}
	});

	// Password reset form submission
	router.post(
		"/auth/reset-password",
		[
			body("newPassword")
				.isLength({ min: 6 })
				.withMessage("Password must be at least 6 characters long"),
			body("confirmPassword")
				.custom((value, { req }) => value === req.body.newPassword)
				.withMessage("Passwords do not match"),
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const errorMessages = errors
					.array()
					.map((error) => he.encode(error.msg));
				return res.status(400).send(`
        <div id="password-reset-response">
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold">Error en el reinicio de contraseña:</span>
            <ul class="list-disc pl-5">
              ${errorMessages.map((msg) => `<li>${msg}</li>`).join("")}
            </ul>
          </div>
        </div>
      `);
			}

			const { newPassword } = req.body;
			const encodedNewPassword = he.encode(newPassword);

			const url = req.headers["hx-current-url"];

			if (!url) {
				return res.status(400).send(`
        <div id="password-reset-response">
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Missing URL</span>
          </div>
        </div>
      `);
			}

			const token = new URL(url).hash.split("=")[1];

			if (!token) {
				return res.status(400).send(`
        <div id="password-reset-response">
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Missing reset token</span>
          </div>
        </div>
      `);
			}

			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				const userId = decoded.userId;

				const user = await User.findByPk(userId);
				if (!user) {
					return res.status(404).send(`
          <div id="password-reset-response">
            <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
              <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
              <span class="font-bold text-center">User not found</span>
            </div>
          </div>
        `);
				}

				const hashedPassword = await bcrypt.hash(encodedNewPassword, 10);
				user.password = hashedPassword;
				await user.save();

				req.login(user, (err) => {
					if (err) {
						console.error("Error logging in user after password reset:", err);
					}
					res.header("HX-Redirect", "/");
					res.send(`
          <div id="password-reset-response">
            <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
              <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
              <span class="font-bold text-center">Password reset successful</span>
            </div>
          </div>
        `);
				});
			} catch (error) {
				console.error("Error resetting password:", error);
				res.status(400).send(`
        <div id="password-reset-response">
          <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
            <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
            <span class="font-bold text-center">Invalid or expired reset token</span>
          </div>
        </div>
      `);
			}
		},
	);

	// User panel route
	router.get("/user-panel.html", isAuthenticated, (req, res) => {
		res.sendFile(path.join(__dirname, "../public/user-panel.html"));
	});

	// Admin panel route
	router.get("/admin-panel.html", isAdmin, (req, res) => {
		res.sendFile(path.join(__dirname, "../public/admin-panel.html"));
	});

	return router;
};
