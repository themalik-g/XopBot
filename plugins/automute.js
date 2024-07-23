const { bot, isAdmin } = require('../lib')
const AutoMute = require('../lib/database/amute') 

const isValidTimeFormat = (time) => {
 const [hours, minutes] = time.split(':')
 return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

bot(
 {
  pattern: 'amute',
  desc: 'sets auto mute time in group.',
  type: 'moderation',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")
  if (!match || !isValidTimeFormat(match)) return message.reply(`Please provide correct form.\nEg: amute 22:00`)

  try {
   const [autoMute, created] = await AutoMute.findOrCreate({
    where: { id: message.chat },
    defaults: { mute: match },
   })
   if (!created) {
    await autoMute.update({ mute: match })
   }
   return message.reply(`Mute time set to ${match} successfully.`)
  } catch (error) {
   console.error('Error in amute command:', error)
   return message.reply('An error occurred while setting mute time.')
  }
 }
)

bot(
 {
  pattern: 'aunmute',
  desc: 'sets unmute time in group.',
  type: 'moderation',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")
  if (!match || !isValidTimeFormat(match)) return message.reply(`Please provide correct form.\nEg: aunmute 07:00`)

  try {
   const [autoMute, created] = await AutoMute.findOrCreate({
    where: { id: message.chat },
    defaults: { unmute: match },
   })
   if (!created) {
    await autoMute.update({ unmute: match })
   }
   return message.reply(`Unmute time set to ${match} successfully.`)
  } catch (error) {
   console.error('Error in aunmute command:', error)
   return message.reply('An error occurred while setting unmute time.')
  }
 }
)

bot(
 {
  pattern: 'dunmute',
  desc: 'Delete unmute from group.',
  type: 'moderation',
 },
 async (message) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  try {
   const autoMute = await AutoMute.findOne({ where: { id: message.chat } })
   if (!autoMute || autoMute.unmute === 'false') {
    return message.reply("There's no unmute set in this group.")
   }
   await autoMute.update({ unmute: 'false' })
   return message.reply('Unmute time deleted successfully.')
  } catch (error) {
   console.error('Error in dunmute command:', error)
   return message.reply('An error occurred while deleting unmute time.')
  }
 }
)

bot(
 {
  pattern: 'dmute',
  desc: 'Delete mute from group.',
  type: 'moderation',
 },
 async (message) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  try {
   const autoMute = await AutoMute.findOne({ where: { id: message.chat } })
   if (!autoMute || autoMute.mute === 'false') {
    return message.reply("There's no mute set in this group.")
   }
   await autoMute.update({ mute: 'false' })
   return message.reply('Mute time deleted successfully.')
  } catch (error) {
   console.error('Error in dmute command:', error)
   return message.reply('An error occurred while deleting mute time.')
  }
 }
)
