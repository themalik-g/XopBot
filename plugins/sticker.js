const config = require('../config')
const { bot, isPrivate, toAudio } = require('../lib/')
const { textToImg } = require('../lib/functions')
bot(
 {
  pattern: 'sticker',
  fromMe: isPrivate,
  desc: 'Converts Photo/video/text to sticker',
  type: 'converter',
 },
 async (message, match, m) => {
  if (!message.reply_message && (!message.reply_message.video || !message.reply_message.sticker || !message.reply_message.text)) return await message.reply('_Reply to photo/video/text_')
  var buff
  if (message.reply_message.text) {
   buff = await textToImg(message.reply_message.text)
  } else {
   buff = await m.quoted.download()
  }

  message.sendMessage(message.jid, buff, { packname: config.PACKNAME, author: config.AUTHOR }, 'sticker')
 }
)

bot(
 {
  pattern: 'take',
  fromMe: isPrivate,
  desc: 'Converts Photo or video to sticker',
  type: 'converter',
 },
 async (message, match, m) => {
  if (!message.reply_message.sticker) return await message.reply('_Reply to a sticker_')
  const packname = match.split(';')[0] || config.PACKNAME
  const author = match.split(';')[1] || config.AUTHOR
  let buff = await m.quoted.download()
  message.sendMessage(message.jid, buff, { packname, author }, 'sticker')
 }
)

bot(
 {
  pattern: 'photo',
  fromMe: isPrivate,
  desc: 'Changes sticker to Photo',
  type: 'converter',
 },
 async (message, match, m) => {
  if (!message.reply_message.sticker) return await message.reply('_Not a sticker_')
  let buff = await m.quoted.download()
  return await message.sendMessage(message.jid, buff, {}, 'image')
 }
)

bot(
 {
  pattern: 'mp3',
  fromMe: isPrivate,
  desc: 'converts video/voice to mp3',
  type: 'downloader',
 },
 async (message, match, m) => {
  let buff = await m.quoted.download()
  console.log(typeof buff)
  buff = await toAudio(buff, 'mp3')
  console.log(typeof buff)
  return await message.sendMessage(message.jid, buff, { mimetype: 'audio/mpeg' }, 'audio')
 }
)

bot(
 {
  pattern: 'img',
  fromMe: isPrivate,
  desc: 'Converts Sticker to image',
  type: 'converter',
 },
 async (message, match, m) => {
  if (!message.reply_message.sticker) return await message.reply('_Reply to a sticker_')
  let buff = await m.quoted.download()
  return await message.sendMessage(message.jid, buff, {}, 'image')
 }
)
