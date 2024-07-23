const { fromBuffer } = require('file-type')
const { bot, isPrivate } = require('../lib/')
const axios = require('axios')
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
 async (context, match) => {
  let url = context.text.split(' ').slice(1).join(' ').trim()

  if (!url) {
   return await context.reply(`_Need Website Link. Usage: ss <url>_`)
  }

  try {
   const screenshotResponse = await captureScreenshot(url)
   if (screenshotResponse.status === 200) {
    // Assuming screenshotResponse.result is a Buffer
    return await context.sendFile(
     {
      image: screenshotResponse.result,
      caption: `Screenshot of ${url}`,
     },
     { quoted: context.message }
    )
   } else {
    await context.reply(`_Failed to capture screenshot. Status: ${screenshotResponse.status}_`)
   }
  } catch (error) {
   console.error('Error capturing screenshot:', error)
   await context.reply('_An error occurred while capturing the screenshot._')
  }
 }
)
bot(
 {
  pattern: 'alive',
  desc: 'Shows system status with different designs.',
  type: 'misc',
 },
 async (message) => {
  try {
   const start = new Date().getTime()
   const designs = [
    async () => {
     const imageBuffer = await axios.get('https://raw.githubusercontent.com/AstroAnalytics/XopBot/main/source/images/logo1.jpeg', {
      responseType: 'arraybuffer',
     })

     const quoteResponse = await axios.get('https://api.maher-zubair.tech/misc/quote')
     const quote = quoteResponse.data
     if (!quote || quote.status !== 200) {
      return await message.reply('*Failed to fetch a quote.*')
     }

     const quoteText = `\n\n*"${quote.result.body}"*\n_- ${quote.result.author}_`
     const end = new Date().getTime()
     const pingSeconds = (end - start) / 1000
     const captionText = `ʀᴇʟᴇᴀsᴇ ᴠ𝟽\n\n*ʀᴇsᴘᴏɴsᴇ ʀᴀᴛᴇ:* ${pingSeconds} seconds${quoteText}`

     return { image: imageBuffer.data, caption: captionText }
    },
    async () => {
     const imageBuffer = await axios.get('https://raw.githubusercontent.com/AstroAnalytics/XopBot/main/source/images/logo2.jpeg', {
      responseType: 'arraybuffer',
     })

     const factResponse = await axios.get('https://api.maher-zubair.tech/misc/fact')
     const fact = factResponse.data
     if (!fact || fact.status !== 200) {
      return await message.reply('*Failed to fetch a fact.*')
     }

     const end = new Date().getTime()
     const pingSeconds = (end - start) / 1000
     const captionText = `ʀᴇʟᴇᴀsᴇ ᴠ𝟽\n\n*ʀᴇsᴘᴏɴsᴇ ʀᴀᴛᴇ:* ${pingSeconds} seconds\n\n\n${fact.result.fact}`

     return { image: imageBuffer.data, caption: captionText }
    },
    async () => {
     const imageBuffer = await axios.get('https://raw.githubusercontent.com/AstroAnalytics/XopBot/main/source/images/logo3.jpg', {
      responseType: 'arraybuffer',
     })

     const lineResponse = await axios.get('https://api.maher-zubair.tech/misc/lines')
     const line = lineResponse.data
     if (!line || line.status !== 200) {
      return await message.reply('*Failed to fetch a line.*')
     }

     const end = new Date().getTime()
     const pingSeconds = (end - start) / 1000
     const captionText = `ʀᴇʟᴇᴀsᴇ ᴠ𝟽\n\n*ʀᴇsᴘᴏɴsᴇ ʀᴀᴛᴇ:* ${pingSeconds} seconds\n\n\n${line.result}`

     return { image: imageBuffer.data, caption: captionText }
    },
   ]

   const randomDesign = designs[Math.floor(Math.random() * designs.length)]
   const messageData = await randomDesign()

   return await message.bot.sendMessage(message.chat, messageData)
  } catch (error) {
   await message.error(error + '\n\nCommand: alive', error)
  }
 }
)
