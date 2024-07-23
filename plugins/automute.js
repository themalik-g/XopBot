const { bot, isAdmin } = require('../lib')
const automuteDB = require('../lib/database/automute')

bot(
 {
  pattern: 'automute',
  fromMe: true,
  desc: 'Set automute time for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  const [time, onOff] = match.split(' ')

  if (!time || !onOff) {
   return await message.reply('_Please specify time and on/off status_')
  }

  const isMuted = onOff.toLowerCase() === 'on'

  await automuteDB.upsert({ groupId: message.jid, muteTime: time, isMuted })

  await message.reply(`_Automute is set to ${onOff} at ${time}_`)
 }
)

bot(
 {
  pattern: 'autounmute',
  fromMe: true,
  desc: 'Set autounmute time for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  const [time, onOff] = match.split(' ')

  if (!time || !onOff) {
   return await message.reply('_Please specify time and on/off status_')
  }

  const isMuted = onOff.toLowerCase() === 'off'

  await automuteDB.upsert({ groupId: message.jid, unmuteTime: time, isMuted })

  await message.reply(`_Autounmute is set to ${onOff} at ${time}_`)
 }
)

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

  const response = `_Automute: ${settings.isMuted ? 'On' : 'Off'} at ${settings.muteTime || 'Not Set'}_\n` + `_Autounmute: ${settings.isMuted ? 'Off' : 'On'} at ${settings.unmuteTime || 'Not Set'}_`

  await message.reply(response)
 }
)
