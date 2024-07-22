const { bot, getUrl, isIgUrl, isPrivate } = require('../lib/')
const insta = require('../mods/index')

bot(
 {
  pattern: 'insta',
  fromMe: isPrivate,
  desc: 'To download instagram media',
  type: 'user',
 },
 async (message, match) => {
  match = match || message.reply_message.text
  if (!match) return await message.sendMessage(message.jid, 'Give me a link')

  const url = getUrl(match.trim())[0]
  if (!url) return await message.sendMessage(message.jid, 'Invalid link')
  if (!isIgUrl(url)) return await message.sendMessage(message.jid, 'Invalid Instagram link')
  if (!isIgUrl(match.trim())) return await message.sendMessage(message.jid, 'Invalid Instagram link')

  try {
   const stream = await insta(url)

   if (!stream) return await message.sendMessage(message.jid, 'No media found on the link')

   // Assuming the stream is a readable stream of the media content
   await message.sendFile(stream)
  } catch (error) {
   await message.sendMessage(message.jid, 'Error: ' + error.message)
  }
 }
)
