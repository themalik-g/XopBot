const { fromBuffer } = require('file-type')
const { bot, isPrivate } = require('../lib/')
const { ffmpeg, parseTimeToSeconds, captureScreenshot } = require('../lib/functions')
bot(
 {
  pattern: 'trim',
  fromMe: isPrivate,
  desc: 'Trim the video or audio',
  type: 'misc',
 },
 async (message, match, m) => {
  if (!message.reply_message || (!message.reply_message.video && !message.reply_message.audio)) {
   return await message.sendMessage('Reply to a media file')
  }
  if (!match) return await message.sendMessage('Give the start and end time in this format: mm:ss|mm:ss')

  const [start, end] = match.split('|')
  if (!start || !end) return await message.sendMessage('Give the start and end time in this format: mm:ss|mm:ss')
  const buffer = await m.quoted.download()
  const startSeconds = parseTimeToSeconds(start)
  const endSeconds = parseTimeToSeconds(end)
  const duration = endSeconds - startSeconds
  const ext = (await fromBuffer(buffer)).ext
  const args = ['-ss', `${startSeconds}`, '-t', `${duration}`, '-c', 'copy']
  const trimmedBuffer = await ffmpeg(buffer, args, ext, ext)
  message.sendFile(trimmedBuffer)
 }
)
bot(
 {
  pattern: 'readmore',
  desc: 'Creates a readmore Text Message.',
  category: 'misc',
 },
 async (message, text) => {
  if (!text) {
   text = '_Provide Text_'
  } else {
   text += ' '
  }
  const readMoreChar = String.fromCharCode(8206).repeat(4001)
  const result = text.includes('readmore') ? text.replace(/readmore/, readMoreChar) : text.replace(' ', readMoreChar)

  await message.reply(result)
 }
)

bot(
 {
  pattern: 'ss',
  fromMe: isPrivate,
  desc: 'Get a screenshot of a webpage',
  type: 'misc',
 },
 async (context, args) => {
  const url = args.split(' ')[0].trim()
  if (!url) {
   return await context.reply(`_Need Website Link_`)
  }

  const screenshotResponse = await captureScreenshot(url)
  if (screenshotResponse.status === 200) {
   return await context.sendMessage(screenshotResponse.result, context)
  } else {
   await context.reply('_No response from server!_')
  }
 }
)
