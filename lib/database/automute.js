const { DataTypes } = require('sequelize')
const config = require('../../config')

// Define Automute Settings Schema
const automuteSchema = {
 groupId: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
 },
 muteTime: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 unmuteTime: {
  type: DataTypes.STRING,
  allowNull: true,
 },
 isAutomuteOn: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
 },
 isAutounmuteOn: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
 },
}

// Define the Automute model
const automuteDB = config.DATABASE.define('Automute', automuteSchema)

module.exports = automuteDB
