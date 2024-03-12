// Model for the Image Table in the Database

const { DataTypes } = require('sequelize')

module.exports = (sequelize, User) => {
  const Image = sequelize.define('Image', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    }

  })

  return Image
}
