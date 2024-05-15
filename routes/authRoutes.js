const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

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
				return res.status(500).send(`
					<div id="register-form-component">
						<dialog id="modal-response" class="modal modal-open error">
							<div class="modal-box text-center items-center justify-center align-middle">
							<form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
								<h3 class="font-bold text-lg">Error en el registro de usuario</h3>
								<ul class="list-disc pl-5 text-left mt-4">
									${errorMessages}
								</ul>
							</div>
						</dialog>
					</div>
				`);
			}

			try {
				const { email, password, name, lastName, idNumber, phoneNumber } =
					req.body;
				const hashedPassword = await bcrypt.hash(password, 10);
				const user = await User.create({
					email,
					password: hashedPassword,
					name,
					lastName,
					idNumber,
					phoneNumber,
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
						<dialog id="modal-response" class="modal modal-open success">
							<div class="modal-box text-center items-center justify-center align-middle">
								<h3 class="font-bold text-lg">Registro de usuario exitoso!</h3>
								<p class="py-4">Verifica tu correo electrónico para activar tu cuenta. <br><br> Redireccionando a la pagina principal...</p>
							</div>
						</dialog>
					</div>
				`);
			} catch (error) {
				console.error("Error registering user:", error);
				res.status(500).send(
					`
					<div id="register-form-component">
							<dialog id="modal-response" class="modal modal-open error">
									<div class="modal-box text-center items-center justify-center align-middle">
											<h3 class="font-bold text-lg">Error en el registro de usuario</h3>
											<p class="py-4">Hubo un problema al crear tu cuenta.<br><br> Inténtalo de nuevo.</p>
									</div>
							</dialog>
					</div>
				`.trim(),
				);
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

			const successHtml = encodeURIComponent(`
				<div id="register-response">
					<dialog id="modal-response" class="modal modal-open auth-success">
						<div class="modal-box text-center items-center justify-center align-middle">
							<form method="dialog">
								<button id="close-button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
							</form>
							<h3 class="font-bold text-lg">Verificacion de cuenta exitosa!</h3>
							<p class="py-4">Por favor inicia sesion para acceder a nuestros servicios.</p>
						</div>
					</dialog>
				</div>
			`);

			res.redirect(`/?success=${successHtml}`);
		} catch (error) {
			console.error("Error verifying email:", error);
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

			passport.authenticate("local", (err, user, info) => {
				if (err) {
					return res.status(500).send(`
			<div id="loginResponse">
			  <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
				<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
				<span class="font-bold text-center">Ocurrió un error durante el proceso de inicio de sesión</span>
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
				  <span class="font-bold text-center">Ocurrió un error durante el proceso de inicio de sesión</span>
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

	return router;
};
