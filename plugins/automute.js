const { bot } = require('../lib')
const automuteDB = require('../lib/database/automute')
const config = require('../config')

// Helper function to parse and format time
function formatTime(time) {
 const [hours, minutes] = time.split(':').map(Number)
 const ampm = hours >= 12 ? 'PM' : 'AM'
 const formattedHours = hours % 12 || 12
 return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes}${ampm}`
}

// Automute command
bot(
 {
  pattern: 'automute ?(.*)',
  fromMe: true,
  desc: 'Set automute time for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  const timeZone = config.TIME_ZONE || 'UTC' // Adjust as needed
  const currentTime = new Date().toLocaleString('en-US', { timeZone })

  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  const timeInput = match.trim()

  if (timeInput.toLowerCase() === 'on') {
   const randomTime = `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`
   await automuteDB.upsert({ groupId: message.jid, muteTime: randomTime, isAutomuteOn: true })
   return await message.reply(`_Automute is set to on at a random time: ${formatTime(randomTime)}_`)
  }

  if (timeInput.toLowerCase() === 'off') {
   await automuteDB.update({ isAutomuteOn: false }, { where: { groupId: message.jid } })
   return await message.reply('_Automute is now off_')
  }

  if (!timeInput) {
   return await message.reply('_Please specify a time or use "on/off" to toggle_')
  }

  await automuteDB.upsert({ groupId: message.jid, muteTime: timeInput, isAutomuteOn: true })
  await message.reply(`_Automute is set to mute the group at ${formatTime(timeInput)}_`)
 }
)

// Autounmute command
bot(
 {
  pattern: 'autounmute ?(.*)',
  fromMe: true,
  desc: 'Set autounmute time for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  const timeInput = match.trim()

  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  if (timeInput.toLowerCase() === 'on') {
   const randomTime = `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`
   await automuteDB.upsert({ groupId: message.jid, unmuteTime: randomTime, isAutounmuteOn: true })
   return await message.reply(`_Autounmute is set to on at a random time: ${formatTime(randomTime)}_`)
  }

  if (timeInput.toLowerCase() === 'off') {
   await automuteDB.update({ isAutounmuteOn: false }, { where: { groupId: message.jid } })
   return await message.reply('_Autounmute is now off_')
  }

  if (!timeInput) {
   return await message.reply('_Please specify a time or use "on/off" to toggle_')
  }

  await automuteDB.upsert({ groupId: message.jid, unmuteTime: timeInput, isAutounmuteOn: true })
  await message.reply(`_Autounmute is set to unmute the group at ${formatTime(timeInput)}_`)
 }
)

// Getmute command
bot(
 {
  pattern: 'getmute',
  fromMe: true,
  desc: 'Get automute settings for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')

  const settings = await automuteDB.findOne({ where: { groupId: message.jid } })

  if (!settings) {
   return await message.reply('_No automute settings found for this group_')
  }

  const muteStatus = settings.isAutomuteOn ? `On at ${formatTime(settings.muteTime)}` : 'Off'
  const unmuteStatus = settings.isAutounmuteOn ? `On at ${formatTime(settings.unmuteTime)}` : 'Off'

  const response = `_Automute: ${muteStatus}_\n` + `_Autounmute: ${unmuteStatus}_`

  await message.reply(response)
 }
)
