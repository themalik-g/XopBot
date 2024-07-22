const { command } = require('../lib/')
const { parsedJid } = require('../lib/functions')
const { banUser, unbanUser, isBanned } = require('../lib/database/ban')

command(
 {
  on: 'message',
  fromMe: true,
  dontAddCommandList: true,
 },
 async (message) => {
  if (!message.isBaileys) return
  const isban = await isBanned(message.jid)
  if (!isban) return
  await message.reply('_Bot is banned in this chat_')
  const jid = parsedJid(message.participant)
  return await message.client.groupParticipantsUpdate(message.jid, jid, 'remove')
 }
)

command(
 {
  pattern: 'antibot',
  fromMe: true,
  desc: 'Turn antibot on or off',
  type: 'group',
 },
 async (message, match) => {
  const chatid = message.jid
  const isban = await isBanned(chatid)

  if (!match[1]) {
   return await message.sendMessage(message.jid, 'Usage: antibot on/off')
  }

  if (match[1].toLowerCase() === 'on') {
   if (isban) {
    return await message.sendMessage(message.jid, 'Antibot is already on')
   }
   await banUser(chatid)
   return await message.sendMessage(message.jid, 'Antibot turned on')
  } else if (match[1].toLowerCase() === 'off') {
   if (!isban) {
    return await message.sendMessage(message.jid, 'Antibot is already off')
   }
   await unbanUser(chatid)
   return await message.sendMessage(message.jid, 'Antibot turned off')
  } else {
   return await message.sendMessage(message.jid, 'Invalid option. Use "on" or "off"')
  }
 }
)
