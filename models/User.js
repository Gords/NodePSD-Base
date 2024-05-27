const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	// biome-ignore lint/complexity/noStaticOnlyClass: Convention used in sequelize
	const User = sequelize.define("User", {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		idNumber: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		phoneNumber: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		loanRequested: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		isAdmin: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		userType: {
			type: DataTypes.ENUM('individual', 'business'),
			allowNull: false,
			defaultValue: 'individual',
		},
	});

	return User;
};
