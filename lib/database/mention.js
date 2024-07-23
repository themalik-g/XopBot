const { DataTypes } = require('sequelize')
const database = require('../../config').DATABASE

// Mention model
const Mention = database.define('mention', {
 enabled: {
  type: DataTypes.BOOLEAN,
 },
 text: {
  type: DataTypes.TEXT,
 },
})

// Get mention data
async function getMention() {
 const mentions = await Mention.findAll()
 return mentions.length > 0 ? mentions[0].dataValues : false
}

// Get mention message
async function getMentionMessage() {
 const mention = await getMention()
 return mention ? mention.text : undefined
}

// Enable or update mention
async function enableMention(enabled, text) {
 if (typeof enabled === 'string') {
  const currentMention = await getMention()
  text = enabled
  enabled = currentMention?.enabled || true
 }

 try {
  const mentions = await Mention.findAll()
  if (mentions.length < 1) {
   return await Mention.create({ enabled, text: text || 'Hi' })
  } else {
   return await mentions[0].update({
    enabled,
    text: text || mentions[0].dataValues.text,
   })
  }
 } catch (error) {
  console.error('Error updating mention:', error)
 }
}

// Personal Message model
const PersonalMessage = database.define('personalMessage', {
 uid: {
  type: DataTypes.STRING,
  allowNull: false,
 },
})

// Check if personal message exists
async function personalMessageExists(uid) {
 const messages = await PersonalMessage.findAll({ where: { uid } })
 return messages.length > 0
}

// Set personal message
async function setPersonalMessage(uid) {
 const messages = await PersonalMessage.findAll({ where: { uid } })
 if (messages.length < 1) {
  await PersonalMessage.create({ uid })
 }
}
const clearFiles = async () => {
 try {
  // Clear all records from the Mention table
  await Mention.destroy({ where: {} })
  console.log('All records cleared from Mention table.')

  // Clear all records from the PersonalMessage table
  await PersonalMessage.destroy({ where: {} })
  console.log('All records cleared from PersonalMessage table.')
 } catch (error) {
  console.error('Error resetting database:', error)
 }
}

module.exports = {
 getMention,
 getMentionMessage,
 enableMention,
 personalMessageExists,
 setPersonalMessage,
 clearFiles,
}
