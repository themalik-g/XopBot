const fs = require('fs')
const config = require('../config')
const { bot, isPrivate } = require('../lib')
const gemini = require('../lib/Gemini')
const { aiImage } = require('../lib/functions')
const { removeBg } = require('../lib/functions')
const fetch = require('node-fetch')

bot(
 {
  pattern: 'gpt',
  desc: 'chat with an AI',
  type: 'ai',
 },
 async (message, query) => {
  if (!query) {
   return message.reply("Provide me a query, e.g., 'What is Life?'")
  }
  try {
   const response = await fetch(`https://api.maher-zubair.tech/ai/chatgpt2?q=${encodeURIComponent(query)}`)
   const data = await response.json()
   if (data && data.status === 200 && data.result) {
    return await message.reply(data.result)
   } else {
    return message.reply('*_Error while getting GPT response!!_*')
   }
  } catch (error) {
   console.error('Error fetching from api.maher-zubair.tech:', error)
  }
 }
)
bot(
 {
  pattern: 'gemini',
  fromMe: isPrivate,
  desc: 'Generate text with gemini',
  type: 'ai',
 },
 async (message, match, m) => {
  match = match || message.reply_message.text
  const id = message.participant
  console.log(id)
  if (!match) return await message.reply('Provide a prompt')
  if (message.reply_message && message.reply_message.video) return await message.reply("I can't generate text from video")
  if (message.reply_message && (message.reply_message.image || message.reply_message.sticker)) {
   const image = await m.quoted.download()

   fs.writeFileSync('image.jpg', image)
   const text = await gemini(match, image, {
    id,
   })
   return await message.reply(text)
  }
  match = message.reply_message ? message.reply_message.text + `\n\n${match || ''}` : match
  const text = await gemini(match, null, { id })
  return await message.reply(text)
 }
)
bot(
 {
  pattern: 'genimg',
  fromMe: isPrivate,
  desc: 'Generate image from text',
  type: 'ai',
 },
 async (message, match) => {
  match = match || message.reply_message.text
  if (!match) return await message.sendMessage(message.jid, 'Provide a text')
  let buff = await aiImage(match)
  if (!Buffer.isBuffer(buff)) return await message.sendMessage(message.jid, buff)
  return await message.sendMessage(
   message.jid,
   buff,
   {
    mimetype: 'image/jpeg',
    caption: 'X-Asena Dall-E Interface',
   },
   'image'
  )
 }
)
bot(
 {
  pattern: 'rmbg',
  fromMe: isPrivate,
  desc: 'Remove background of an image',
  type: 'ai',
 },
 async (message, match, m) => {
  if (!config.REMOVEBG) return await message.sendMessage(message.jid, 'Set RemoveBg API Key in config.js \n Get it from https://www.remove.bg/api')
  if (!message.reply_message && !message.reply_message.image) return await message.reply('Reply to an image')
  let buff = await m.quoted.download()
  let buffer = await removeBg(buff)
  if (!buffer) return await message.reply('An error occured')
  await message.sendMessage(
   message.jid,
   buffer,
   {
    quoted: message.reply_message.key,
    mimetype: 'image/png',
    fileName: 'removebg.png',
   },
   'document'
  )
 }
)
