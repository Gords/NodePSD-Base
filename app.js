// Server setup and database connection
// Import dependencies
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");
const urlRewrite = require("express-urlrewrite");
const path = require("node:path");

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));



// Configure session middleware
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	}),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Local Strategy
passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ where: { email: username } });
			if (!user) {
				return done(null, false);
			}
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				return done(null, false);
			}
			return done(null, user);
		} catch (error) {
			return done(error);
		}
	}),
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
	done(null, {
		id: user.id,
		name: user.name,
		email: user.email,
	});
});

passport.deserializeUser(async ({ id }, done) => {
	try {
		const user = await User.findByPk(id);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: "postgres",
		logging: console.log,
	},
);

const User = require("./models/User.js")(sequelize, DataTypes);
const Image = require("./models/Image.js")(sequelize, DataTypes);
const Loan = require("./models/Loan.js")(sequelize, DataTypes);
const TypeOfLoan = require("./models/TypeOfLoan.js")(sequelize, DataTypes);

const routes = require("./routes/routes.js")({
	User,
	Image,
	Loan,
	TypeOfLoan,
	sequelize,
});
app.use("/", routes);
app.use(express.static(path.join(__dirname, "public")));

// URL rewriting rules
app.use(urlRewrite(/^\/admin-panel$/, "/admin-panel.html"));
app.use(urlRewrite(/^\/user-panel$/, "/user-panel.html"));

sequelize
	.authenticate()
	.then(() => {
		console.log("Database connection has been established successfully.");
		app.listen(3000, () => {
			console.log("Server is running on port 3000");
		});
	})
	.catch((error) => {
		console.error("Unable to connect to the database:", error);
	});
