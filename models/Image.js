// Model for the Image Table in the Database

'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Image.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }
  }
  Image.init({
    userId: DataTypes.STRING,
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Image'
  })
  return Image
}
