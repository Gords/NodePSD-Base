const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const he = require("he")

module.exports = (User) => {
	// User registration
	router.post(
		"/auth/register",
		[
			body("email").isEmail().withMessage("Invalid email address"),
			body("password")
				.isLength({ min: 6 })
				.withMessage("Password must be at least 6 characters long"),
			body("name")
				.matches(/^[A-Za-z\s]+$/)
				.withMessage("Name should only contain letters and spaces"),
			body("lastName")
				.matches(/^[A-Za-z\s]+$/)
				.withMessage("Last name should only contain letters and spaces"),
			body("idNumber")
				.isLength({ max: 8 })
				.withMessage("ID number should be less than or equal to 8 digits"),
			body("phoneNumber")
				.matches(/^\+595\d{9}$/)
				.withMessage("Invalid Paraguay phone number"),
		],
		async (req, res) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const errorMessages = errors.array().map((error) => error.msg);
				return res.status(500).send(`
			<div id="register-form-component">
			  <div class="card m-auto max-w-sm shadow-xl">
				<div class="card-body flex min-h-full flex-col justify-center lg:px-8">
				  <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
					<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
					<span class="font-bold">Error en el registro:</span>
					<ul class="list-disc pl-5">
					  ${errorMessages.map((msg) => `<li>${msg}</li>`).join("")}
					</ul>
				  </div>
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
				res.status(200).send(`
		  <div id="register-form-component">
			<div class="card m-auto max-w-sm shadow-xl">
			  <div class="card-body flex min-h-full flex-col justify-center lg:px-8">
				<div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
				  <img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
				  <span class="font-bold">Registro de usuario exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.</span>
				</div>
			  </div>
			</div>
		  </div>
		`);
    } catch (error) {
		console.error("Error registering user:", error);
		if (error.name === "SequelizeUniqueConstraintError") {
		  // Handle unique constraint violation error
		  res.status(400).send(
			`
			  <div id="register-form-component">
				<div class="card m-auto max-w-sm shadow-xl">
				  <div class="card-body flex min-h-full flex-col justify-center lg:px-8">
					<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
					  <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
					  <span class="font-bold">El correo electrónico ya está registrado. Por favor, utiliza otro correo electrónico.</span>
					</div>
				  </div>
				</div>
			  </div>
			`.trim()
		  );
		} else {
		  res.status(500).send(
			`
			  <div id="register-form-component">
				<div class="card m-auto max-w-sm shadow-xl">
				  <div class="card-body flex min-h-full flex-col justify-center lg:px-8">
					<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
					  <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
					  <span class="font-bold">Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.</span>
					</div>
				  </div>
				</div>
			  </div>
			`.trim()
		  );
		}
	  }
	}
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

			res.redirect(
				"/?message=Email verified successfully. You can now log in.",
			);
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
router.post("/auth/forgot-password", async (req, res) => {
	const email = req.body.username;
  
	if (!email) {
	  return res.status(400).send(`
		<div id="forgotPasswordResponse">
		  <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
			<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
			<span class="font-bold text-center">Please provide a valid email address.</span>
		  </div>
		</div>
	  `);
	}
  
	try {
	  const user = await User.findOne({ where: { email } });
	  if (!user) {
		return res.status(404).send(`
		  <div id="forgotPasswordResponse">
			<div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
			  <img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
			  <span class="font-bold text-center">User not found</span>
			</div>
		  </div>
		`);
	  }
  
	  // Generate password reset token
	  const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
	  // Send password reset email
	  await emailService.sendPasswordResetEmail(email, resetToken);
  
	  res.send(`
		<div id="forgotPasswordResponse">
		  <div role="alert" class="alert alert-success max-w-sm mx-auto border-black">
			<img src="./assets/icons/success.svg" alt="Success Symbol" class="w-6 h-6 inline-block">
			<span class="font-bold text-center">Password reset email sent. Please check your email for the reset link.</span>
		  </div>
		</div>
	  `);
	} catch (error) {
	  console.error("Error sending password reset email:", error);
	  res.status(500).send(`
		<div id="forgotPasswordResponse">
		  <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
			<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
			<span class="font-bold text-center">Failed to send password reset email. Please try again later.</span>
		  </div>
		</div>
	  `);
	}
  });

// Password reset form submission
router.post("/auth/reset-password", async (req, res) => {
	const { newPassword, confirmPassword } = req.body;
	const url = req.headers['hx-current-url'];
	console.log(url)
  
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
  
	const token = new URL(url).hash.split('=')[1];
  
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
  
	if (newPassword !== confirmPassword) {
	  return res.status(400).send(`
		<div id="password-reset-response">
		  <div role="alert" class="alert alert-error max-w-sm mx-auto border-black">
			<img src="./assets/icons/error.svg" alt="Error Symbol" class="w-6 h-6 inline-block">
			<span class="font-bold text-center">Passwords do not match</span>
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
  
	  const hashedPassword = await bcrypt.hash(newPassword, 10);
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
  });

	return router;
};
