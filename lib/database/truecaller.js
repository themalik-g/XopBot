const config = require('../../config')
const { DataTypes } = require('sequelize')

// Define column attributes
const stringFieldConfig = {
 type: DataTypes.STRING,
 allowNull: true,
}

// Define table schema
const trueCallerSchema = {
 key: stringFieldConfig,
 token: stringFieldConfig,
 number: stringFieldConfig,
}

// Define the TrueCaller model
const trueCallerDB = config.DATABASE.define('trueCaller', trueCallerSchema)

// Function to set TrueCaller key
async function setTrueCallerKey(options = {}) {
 const existingRecord = await trueCallerDB.findOne()

 const newValues = {
  key: options.key,
  token: options.token,
  number: options.number,
 }

 if (!existingRecord) {
  await trueCallerDB.create(newValues)
  return 'created'
 } else {
  await existingRecord.update(newValues)
  return 'updated'
 }
}

// Function to get TrueCaller token
async function getTrueCallerToken() {
 const record = await trueCallerDB.findOne()

 if (record) {
  return {
   key: record.dataValues.key,
   token: record.dataValues.token,
   number: record.dataValues.number,
  }
 } else {
  return {
   key: false,
   token: false,
   number: false,
  }
 }
}

// Function to log out from TrueCaller
async function trueLogout() {
 const records = await trueCallerDB.findAll()

 for (const record of records) {
  await record.destroy()
 }

 return true
}

async function search(number) {
 const record = await trueCallerDB.findOne({ where: { number } })
 if (record) {
  return {
   status: true,
   key: record.dataValues.key,
   token: record.dataValues.token,
   number: record.dataValues.number,
  }
 } else {
  return {
   status: false,
   message: 'Number not found',
  }
 }
}

// Export functions
module.exports = {
 setTrueCallerKey,
 getTrueCallerToken,
 trueLogout,
 search,
}
