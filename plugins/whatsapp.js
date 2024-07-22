const config = require('../config')
const { bot, parsedJid, isPrivate, serialize } = require('../lib/')
const { loadMessage } = require('../lib/database/StoreDb')
bot(
 {
  pattern: 'forward',
  fromMe: isPrivate,
  desc: 'Forwards the replied Message',
  type: 'whatsapp',
 },
 async (message, match, m) => {
  if (!m.quoted) return message.reply('Reply to something')
  let jids = parsedJid(match)
  for (let i of jids) {
   await message.forward(i, message.reply_message.message)
  }
 }
)
bot(
 {
  pattern: 'vv',
  fromMe: isPrivate,
  desc: 'Forwards The View once messsage',
  type: 'whatsapp',
 },
 async (message, match, m) => {
  let buff = await m.quoted.download()
  return await message.sendFile(buff)
 }
)

bot(
 {
  on: 'text',
  fromMe: !config.STATUS_SAVER,
  desc: 'Save or Give Status Updates',
  dontAddCommandList: true,
  type: 'whatsapp',
 },
 async (message, match, m) => {
  try {
   if (message.isGroup) return
   const triggerKeywords = ['save']
   const cmdz = match.toLowerCase().split(' ')[0]
   if (triggerKeywords.some((tr) => cmdz.includes(tr))) {
    const relayOptions = { messageId: m.quoted.key.id }
    return await message.client.relayMessage(message.jid, m.quoted.message, relayOptions)
   }
  } catch (error) {
   console.error('[Error]:', error)
  }
 }
)
bot(
 {
  pattern: 'quoted',
  fromMe: isPrivate,
  desc: 'quoted message',
  type: 'whatsapp',
 },
 async (message, match) => {
  if (!message.reply_message) return await message.reply('*Reply to a message*')
  let key = message.reply_message.key
  let msg = await loadMessage(key.id)
  if (!msg) return await message.reply('_Message not found maybe bot might not be running at that time_')
  msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client)
  if (!msg.quoted) return await message.reply('No quoted message found')
  await message.forward(message.jid, msg.quoted.message)
 }
)
bot(
 {
  pattern: 'setpp',
  fromMe: true,
  desc: 'Set profile picture',
  type: 'whatsapp',
 },
 async (message, match, m) => {
  if (!message.reply_message.image) return await message.reply('_Reply to a photo_')
  let buff = await m.quoted.download()
  await message.setPP(message.user, buff)
  return await message.reply('_Profile Picture Updated_')
 }
)

bot(
 {
  pattern: 'setname',
  fromMe: true,
  desc: 'Set User name',
  type: 'whatsapp',
 },
 async (message, match) => {
  if (!match) return await message.reply('_Enter name_')
  await message.updateName(match)
  return await message.reply(`_Username Updated : ${match}_`)
 }
)

bot(
 {
  pattern: 'block',
  fromMe: true,
  desc: 'Block a person',
  type: 'whatsapp',
 },
 async (message, match) => {
  if (message.isGroup) {
   let jid = message.mention[0] || message.reply_message.jid
   if (!jid) return await message.reply('_Reply to a person or mention_')
   await message.block(jid)
   return await message.sendMessage(`_@${jid.split('@')[0]} Blocked_`, {
    mentions: [jid],
   })
  } else {
   await message.block(message.jid)
   return await message.reply('_User blocked_')
  }
 }
)

bot(
 {
  pattern: 'unblock',
  fromMe: true,
  desc: 'Unblock a person',
  type: 'whatsapp',
 },
 async (message, match) => {
  if (message.isGroup) {
   let jid = message.mention[0] || message.reply_message.jid
   if (!jid) return await message.reply('_Reply to a person or mention_')
   await message.block(jid)
   return await message.sendMessage(message.jid, `_@${jid.split('@')[0]} unblocked_`, {
    mentions: [jid],
   })
  } else {
   await message.unblock(message.jid)
   return await message.reply('_User unblocked_')
  }
 }
)

bot(
 {
  pattern: 'jid',
  fromMe: true,
  desc: 'Give jid of chat/user',
  type: 'whatsapp',
 },
 async (message, match) => {
  return await message.sendMessage(message.jid, message.mention[0] || message.reply_message.jid || message.jid)
 }
)

bot(
 {
  pattern: 'del',
  fromMe: true,
  desc: 'deletes a message',
  type: 'whatsapp',
 },
 async (message, match, m, client) => {
  if (message.isGroup) {
   client.sendMessage(message.jid, { delete: message.reply_message.key })
  }
 }
)
