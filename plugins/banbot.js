const { bot } = require('../lib/');
const { parsedJid } = require('../lib/functions');
const { banUser, unbanUser, isBanned } = require('../lib/database/ban');

// Handle the ban logic for incoming messages
bot({
  on: 'message',
  fromMe: true,
  dontAddCommandList: true,
}, async (message) => {
  if (!message.isBaileys) return;

  const isban = await isBanned(message.jid);
  if (!isban) return;

  await message.reply('_Bot is banned in this chat_');
  const jid = parsedJid(message.participant);
  await message.client.groupParticipantsUpdate(message.jid, jid, 'remove');
});

// Handle the antibot command
bot({
  pattern: 'antibot',
  fromMe: true,
  desc: 'Toggle bot ban status in a chat',
  type: 'command',
}, async (message, match) => {
  const chatid = message.jid;
  const action = match[1]; // Capture the argument (on or off)

  try {
    if (action === 'on') {
      const isban = await isBanned(chatid);
      if (isban) {
        return await message.sendMessage(chatid, 'Bot is already banned');
      }
      await banUser(chatid);
      return await message.sendMessage(chatid, 'Bot banned');
    } 
    else if (action === 'off') {
      const isban = await isBanned(chatid);
      if (!isban) {
        return await message.sendMessage(chatid, 'Bot is not banned');
      }
      await unbanUser(chatid);
      return await message.sendMessage(chatid, 'Bot unbanned');
    } 
    else {
      return await message.sendMessage(chatid, 'Invalid argument. Use "on" to ban or "off" to unban.');
    }
  } catch (error) {
    console.error('Error handling antibot command:', error);
    return await message.sendMessage(chatid, 'An error occurred while processing the command.');
  }
});
