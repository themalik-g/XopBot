const { bot, getBuffer } = require('../lib')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

let placeholderImageUrl = 'https://telegra.ph/file/b8e96b599e0fa54d25940.jpg'
const emailDataStore = {}

bot(
 {
  pattern: 'tempmail',
  desc: 'Create temporary email address and use it as needed.',
  type: 'mail',
 },
 async (context) => {
  try {
   const sender = context.sender

   if (!emailDataStore[sender]) {
    const newEmailData = await tempmail.create()
    if (!newEmailData || !newEmailData[0]) {
     return await context.reply('Request Denied!')
    }

    const [login, domain] = newEmailData[0].split('@')
    emailDataStore[sender] = { email: newEmailData[0], login, domain }
   }

   let imageBuffer = false
   try {
    imageBuffer = await getBuffer(placeholderImageUrl)
   } catch (error) {
    console.log(error)
   }

   const emailInfo = emailDataStore[sender]
   await context.reply(`NEW MAIL\n\nEMAIL: ${emailInfo.email}\nLOGIN: ${emailInfo.login}\nADDRESS: ${emailInfo.domain}\n`)
  } catch (error) {
   console.log(error)
   await context.reply('Request Denied!')
  }
 }
)

bot(
 {
  pattern: 'checkmail',
  type: 'mail',
  desc: 'Check mails in your temporary email address.',
 },
 async (context) => {
  try {
   const sender = context.sender
   const emailInfo = emailDataStore[sender]

   if (!emailInfo || !emailInfo.email) {
    return await context.reply(`_You Didn't Create Any Mail_`)
   }

   const receivedMails = await tempmail.mails(emailInfo.login, emailInfo.domain)
   if (!receivedMails || receivedMails.length === 0) {
    return await context.reply(`_EMPTY ➪ No Mails Here_`)
   }

   let imageBuffer = false
   try {
    imageBuffer = await getBuffer(placeholderImageUrl)
   } catch (error) {
    console.log(error)
   }

   for (const mail of receivedMails) {
    const emailContent = await tempmail.emailContent(emailInfo.login, emailInfo.domain, mail.id)
    if (emailContent) {
     const mailInfo = `From ➪ ${mail.from}\nDate ➪ ${mail.date}\nEMAIL ID ➪ [${mail.id}]\nSubject ➪ ${mail.subject}\nContent ➪ ${emailContent}`
     await context.reply(mailInfo)
    }
   }
  } catch (error) {
   console.log(error)
   await context.reply('Request Denied!')
  }
 }
)

bot(
 {
  pattern: 'delmail',
  type: 'mail',
  desc: 'Delete temporary email address.',
 },
 async (context) => {
  try {
   const sender = context.sender
   if (emailDataStore[sender]) {
    delete emailDataStore[sender]
    await context.reply('_Deleted the email address._')
   } else {
    await context.reply('No email address to delete.')
   }
  } catch (error) {
   console.log(error)
   await context.reply('Request Denied!')
  }
 }
)

const tempmail = {
 create: async () => {
  const url = 'https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1'
  try {
   let response = await fetch(url)
   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
   let data = await response.json()
   return data
  } catch (error) {
   console.log(error)
   return null
  }
 },

 mails: async (login, domain) => {
  const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
  try {
   let response = await fetch(url)
   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
   let data = await response.json()
   return data
  } catch (error) {
   console.log(error)
   return null
  }
 },

 emailContent: async (login, domain, id) => {
  const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`
  try {
   let response = await fetch(url)
   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
   let emailData = await response.json()
   const htmlContent = emailData.htmlBody
   console.log({ htmlContent })

   const $ = cheerio.load(htmlContent)
   const textContent = $.text()
   return textContent
  } catch (error) {
   console.log(error)
   return null
  }
 },
}
