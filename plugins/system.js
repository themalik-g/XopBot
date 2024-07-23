const { bot, isPrivate } = require('../lib')
const { exec } = require('child_process')
const formatRuntime = require('./_menu')
function executeCommand(command) {
 return new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
   if (error) {
    reject(`> Error: ${error.message}`)
    return
   }
   if (stderr) {
    reject(`> Error: ${stderr}`)
    return
   }
   resolve(stdout)
  })
 })
}
bot(
 {
  pattern: 'ping',
  fromMe: isPrivate,
  desc: 'To check ping',
  type: 'system',
 },
 async (message, match) => {
  const start = new Date().getTime()
  const end = new Date().getTime()
  return await message.reply(`> *ʟᴀᴛᴇɴᴄʏ ${(end - start)} ᴍs*`)
 }
)

bot(
 {
  pattern: 'shutdown',
  fromMe: isPrivate,
  desc: 'Shutdown the bot server',
  type: 'system',
 },
 async (message) => {
  await message.reply('Shutting down the bot server...')
  process.exit(0)
 }
)

bot(
 {
  pattern: 'restart',
  fromMe: isPrivate,
  desc: 'Restart all PM2 processes',
  type: 'system',
 },
 async (message) => {
  try {
   await message.reply('Restarting all PM2 processes...')

   const pm2 = require('pm2')

   pm2.connect((err) => {
    if (err) {
     console.error(err)
     message.reply('Failed to connect to PM2.')
     return
    }

    pm2.restart('all', (err) => {
     if (err) {
      console.error(err)
      message.reply('Failed to restart PM2 processes.')
     } else {
      message.reply('All PM2 processes have been restarted successfully.')
     }

     pm2.disconnect()
    })
   })
  } catch (error) {
   console.error(error)
   message.reply('An error occurred while attempting to restart PM2 processes.')
  }
 }
)

bot(
 {
  pattern: 'console ?(.*)',
  fromMe: isPrivate,
  desc: 'Execute a command on the server console',
  type: 'system',
 },
 async (message, match) => {
  const command = match[1]
  if (!command) {
   return await message.reply('Please provide a command to execute.')
  }

  try {
   const output = await executeCommand(command)
   await message.reply(`Command executed successfully:\n\n${output}`)
  } catch (error) {
   await message.reply(`Failed to execute command:\n\n${error}`)
  }
 }
)

bot(
 {
  pattern: 'sysinfo ?(.*)',
  fromMe: isPrivate,
  desc: 'Get system information',
  type: 'system',
 },
 async (message) => {
  try {
   const uptimeSeconds = Math.floor(process.uptime())
   const uptimeFormatted = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8)

   const memoryUsage = process.memoryUsage()
   const memoryFormatted = {
    rss: `${Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100} MB`,
    heapTotal: `${Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100} MB`,
    heapUsed: `${Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100} MB`,
   }

   const sysInfo = `*_Server Specs_*
\t \`\`\` Node ${process.version} \`\`\`
> Platform: ${process.platform}
> Architecture: ${process.arch}
> PID: ${process.pid}
> Uptime: ${uptimeFormatted}
> Memory Usage:
> RSS: ${memoryFormatted.rss}
> Heap Total: ${memoryFormatted.heapTotal}
> Heap Used: ${memoryFormatted.heapUsed}`

   await message.reply(sysInfo)
  } catch (error) {
   await message.reply(`Error retrieving system information: ${error.message}`)
  }
 }
)

bot(
 {
  pattern: 'processes',
  fromMe: isPrivate,
  desc: 'List all running processes',
  type: 'system',
 },
 async (message) => {
  try {
   const command = process.platform === 'win32' ? 'tasklist' : 'ps aux'
   const output = await executeCommand(command)
   await message.reply(`Running Processes:\n\n${output}`)
  } catch (error) {
   await message.reply(`Failed to retrieve process list: ${error}`)
  }
 }
)
bot(
 {
  pattern: 'runtime ?(.*)',
  fromMe: isPrivate,
  desc: 'Check uptime of bot',
  type: 'user',
 },
 async (message) => {
  message.reply(`> *_Alive Since: ${formatRuntime(process.uptime())}_*`)
 }
)
