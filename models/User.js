const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
		assignedAdmin: {
			type: DataTypes.INTEGER,
			references: {
				model: 'Users', // 'Users' refers to the table name
				key: 'id',
			},
			allowNull: true,
		}
	});

	// Define associations
	User.associate = function(models) {
		// A user (with isAdmin: true) can have many users assigned to them
		User.hasMany(models.User, {
			foreignKey: 'assignedAdmin',
			as: 'assignedUsers'
		});
		// A user can have one admin assigned to it
		User.belongsTo(models.User, {
			foreignKey: 'assignedAdmin',
			as: 'admin'
		});
	};

	return User;
};
