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
  const chatId = message.jid
  const isAntibotActive = await isBanned(chatId)

  // Extract and trim the command option
  const option = (match[1] || '').trim().toLowerCase()

  if (option === '') {
   return await message.sendMessage(chatId, 'Usage: antibot on/off')
  }

  switch (option) {
   case 'on':
    if (isAntibotActive) {
     return await message.sendMessage(chatId, 'Antibot is already on')
    }
    await banUser(chatId)
    return await message.sendMessage(chatId, 'Antibot turned on')

   case 'off':
    if (!isAntibotActive) {
     return await message.sendMessage(chatId, 'Antibot is already off')
    }
    await unbanUser(chatId)
    return await message.sendMessage(chatId, 'Antibot turned off')

   default:
    return await message.sendMessage(chatId, 'Invalid option. Use "on" or "off"')
  }
 }
)
