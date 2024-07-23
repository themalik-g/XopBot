const config = require('../config')
const { bot, isPrivate, toAudio } = require('../lib')
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

bot(
 {
  pattern: 'ebinary',
  desc: 'Encode binary',
  category: 'converter',
 },
 async (context, text) => {
  let inputText = text ? text : context.reply_text
  if (!inputText) {
   return context.reply('*_Send text to be encoded.!_*')
  }
  let binaryText = inputText
   .split('')
   .map((char) => {
    return char.charCodeAt(0).toString(2)
   })
   .join(' ')
  await context.reply(binaryText)
 }
)

bot(
 {
  pattern: 'dbinary',
  desc: 'Decode binary',
  category: 'converter',
 },
 async (context, text) => {
  let binaryText = text ? text : context.reply_text
  if (!binaryText) {
   return context.reply('Send text to be decoded.')
  }
  let binaryArray = binaryText.split(' ')
  let decodedText = binaryArray.map((binary) => String.fromCharCode(parseInt(binary, 2))).join('')
  await context.reply(decodedText)
 }
)

bot(
 {
  pattern: 'qr',
  category: 'converter',
  desc: 'Convert any Data to Qr.',
 },
 async (context, text) => {
  if (!text) {
   return context.reply('*Provide Text To generate QR!*')
  }
  let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${text}`
  await context.client.sendMessage(context.jid, { caption: '*_Scan QR To Get Your Text_*' }, { quoted: context }, 'image', qrUrl)
 }
)
const audtypes = ['audioMessage', 'videoMessage']
bot(
 {
  pattern: 'tomp3',
  desc: 'Changes type to audio.',
  category: 'converter',
 },
 async (context) => {
  let messageType = audtypes.includes(context.mtype) ? context : context.reply_message
  if (!messageType || !audtypes.includes(messageType?.mtype)) {
   return context.reply('*Reply to A Video.*')
  }
  let filePath = await context.client.downloadAndSaveMediaMessage(messageType)
  const { toAudio } = require('../lib')
  let fileData = fs.readFileSync(filePath)
  let audioData = await toAudio(fileData)
  try {
   fs.unlink(filePath)
  } catch (error) {}
  return await context.client.sendMessage(context.jid, {
   audio: audioData,
   mimetype: 'audio/mpeg',
  })
 }
)

bot(
 {
  pattern: 'ptt',
  desc: 'Convert Video To Audio Voice Note.',
  category: 'converter',
 },
 async (context) => {
  let messageType = audtypes.includes(context.mtype) ? context : context.reply_message
  if (!messageType || !audtypes.includes(messageType?.mtype)) {
   return context.reply('*Reply to audio/video*')
  }
  let filePath = await context.client.downloadAndSaveMediaMessage(messageType)
  const { toPTT } = require('../lib')
  let fileData = fs.readFileSync(filePath)
  let pttData = await toPTT(fileData)
  try {
   fs.unlinkSync(filePath)
  } catch (error) {}
  return await context.client.sendMessage(context.jid, {
   audio: pttData,
   ptt: true,
   mimetype: 'audio/mpeg',
  })
 }
)
