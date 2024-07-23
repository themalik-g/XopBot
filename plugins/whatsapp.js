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
  pattern: 'pp ?(.*)',
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

bot(
 {
  pattern: 'rpp',
  fromMe: true,
  desc: 'Removes Profile Picture',
  type: 'whatsapp',
 },
 async (message) => {
  try {
   await message.client.removeProfilePicture(message.user)
   await message.reply('_Profile Picture Removed_')
  } catch (error) {
   console.error('Error removing profile picture:', error)
   await message.reply('_Failed to remove profile picture_')
  }
 }
)

bot(
 {
  pattern: 'vcard',
  desc: 'Create Contact by given name.',
  type: 'WhatsApp',
 },
 async (message, name) => {
  if (!message.quoted) {
   return message.reply('_Reply User With Name_')
  }
  if (!name) {
   return message.reply('_You Tagged, Now Add Name!_')
  }
  const nameParts = name.split(' ')
  if (nameParts.length > 3) {
   name = nameParts.slice(0, 3).join(' ')
  }
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:;\nTEL;type=CELL;type=VOICE;waid=${message.quoted.sender.split('@')[0]}:+${owner[0]}\nEND:VCARD`
  const contact = {
   contacts: {
    displayName: name,
    contacts: [{ vcard }],
   },
  }
  return await message.client.sendMessage(message.chat, contact, { quoted: message })
 }
)

bot(
 {
  pattern: 'edit',
  fromMe: true,
  desc: 'Edit message that was sent by bot',
  type: 'WhatsApp',
 },
 async (message, text) => {
  await message.client.edit(message.jid, message.reply_message.id, text)
 }
)

bot(
 {
  pattern: 'wa',
  desc: 'Get wa.me link for quoted or mentioned user.',
  type: 'WhatsApp',
 },
 async (m) => {
  const userJid = m.reply_message ? m.reply_message.sender : m.mentionedJid[0] || false
  const waLink = userJid ? `https://wa.me/${userJid.split('@')[0]}` : '_Reply Or Mention A User_'
  await m.reply(waLink)
 }
)

bot(
 {
  pattern: 'join',
  fromMe: true,
  info: 'joins group by link',
  type: 'WhatsApp',
 },
 async (message, args) => {
  let groupLink = message.reply_message?.groupInvite ? message.reply_message.msg : args || message.reply_text
  const groupPattern = /https:\/\/chat\.whatsapp\.com\/([^\s]+)/
  const match = groupLink.match(groupPattern)

  if (!match) {
   return message.reply('*_Provide Group Link!_*')
  }

  let groupId = match[1].trim()
  const joinResponse = await message.bot.groupAcceptInvite(groupId)
  if (joinResponse.includes('joined to:')) {
   return reply(message, '*_Joined_*', {}, '', message)
  }
 }
)
