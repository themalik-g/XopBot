const { DataTypes } = require('sequelize')
const config = require('../../config')

const AutoMute = config.DATABASE.define('AutoMute', {
 id: {
  type: DataTypes.STRING,
  primaryKey: true,
  allowNull: false,
 },
 mute: {
  type: DataTypes.STRING,
  defaultValue: 'false',
 },
 unmute: {
  type: DataTypes.STRING,
  defaultValue: 'false',
 },
})

module.exports = AutoMute
