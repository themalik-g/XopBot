const got = require('got')
const Heroku = require('heroku-client')
const { bot } = require('../lib/')
const Config = require('../config')
const heroku = new Heroku({ token: Config.HEROKU_API_KEY })
const { secondsToDHMS } = require('../lib/functions')
async function checkHerokuConfig(message) {
 if (!Config.HEROKU) return await message.reply('You are not using Heroku as your server.')
 if (Config.HEROKU_APP_NAME === '') return await message.reply('Add `HEROKU_APP_NAME` env variable')
 if (Config.HEROKU_API_KEY === '') return await message.reply('Add `HEROKU_API_KEY` env variable')
 return true
}
bot(
 {
  pattern: 'dyno',
  fromMe: true,
  desc: 'Show Quota info',
  type: 'heroku',
 },
 async (message) => {
  if (!Config.HEROKU) return await message.reply('You are not using Heroku as your server.')

  if (Config.HEROKU_APP_NAME === '') return await message.reply('Add `HEROKU_APP_NAME` env variable')
  if (Config.HEROKU_API_KEY === '') return await message.reply('Add `HEROKU_API_KEY env variable')

  try {
   heroku
    .get('/account')
    .then(async (account) => {
     const url = `https://api.heroku.com/accounts/${account.id}/actions/get-quota`
     headers = {
      'User-Agent': 'Chrome/80.0.3987.149 Mobile Safari/537.36',
      Authorization: 'Bearer ' + Config.HEROKU_API_KEY,
      Accept: 'application/vnd.heroku+json; version=3.account-quotas',
     }
     const res = await got(url, { headers })
     const resp = JSON.parse(res.body)
     const total_quota = Math.floor(resp.account_quota)
     const quota_used = Math.floor(resp.quota_used)
     const remaining = total_quota - quota_used
     const quota = `Total Quota : ${secondsToDHMS(total_quota)}
Used  Quota : ${secondsToDHMS(quota_used)}
Remaning    : ${secondsToDHMS(remaining)}`
     await message.reply('```' + quota + '```')
    })
    .catch(async (error) => {
     return await message.reply(`HEROKU : ${error.body.message}`)
    })
  } catch (error) {
   await message.reply(error)
  }
 }
)

bot(
 {
  pattern: 'getvar',
  fromMe: true,
  desc: 'Get a specific environment variable',
  type: 'heroku',
 },
 async (message, match) => {
  if (!(await checkHerokuConfig(message))) return

  const varName = match[1]
  if (!varName) return await message.reply('Please specify a variable name')

  try {
   const app = await heroku.get(`/apps/${Config.HEROKU_APP_NAME}`)
   const config = await heroku.get(`/apps/${app.id}/config-vars`)

   if (varName in config) {
    await message.reply(`${varName}: ${config[varName]}`)
   } else {
    await message.reply(`Variable ${varName} not found`)
   }
  } catch (error) {
   await message.reply(`Error: ${error.message}`)
  }
 }
)

bot(
 {
  pattern: 'setvar',
  fromMe: true,
  desc: 'Set or update an environment variable',
  type: 'heroku',
 },
 async (message, match) => {
  if (!(await checkHerokuConfig(message))) return

  const [varName, varValue] = match[1].split('=').map((item) => item.trim())
  if (!varName || !varValue) return await message.reply('Usage: setvar NAME=VALUE')

  try {
   await heroku.patch(`/apps/${Config.HEROKU_APP_NAME}/config-vars`, {
    body: {
     [varName]: varValue,
    },
   })
   await message.reply(`Variable ${varName} set to ${varValue}`)
  } catch (error) {
   await message.reply(`Error: ${error.message}`)
  }
 }
)

bot(
 {
  pattern: 'removevar',
  fromMe: true,
  desc: 'Remove an environment variable',
  type: 'heroku',
 },
 async (message, match) => {
  if (!(await checkHerokuConfig(message))) return

  const varName = match[1]
  if (!varName) return await message.reply('Please specify a variable name to remove')

  try {
   await heroku.patch(`/apps/${Config.HEROKU_APP_NAME}/config-vars`, {
    body: {
     [varName]: null,
    },
   })
   await message.reply(`Variable ${varName} removed`)
  } catch (error) {
   await message.reply(`Error: ${error.message}`)
  }
 }
)

bot(
 {
  pattern: 'listvars',
  fromMe: true,
  desc: 'List all environment variables',
  type: 'heroku',
 },
 async (message) => {
  if (!(await checkHerokuConfig(message))) return

  try {
   const app = await heroku.get(`/apps/${Config.HEROKU_APP_NAME}`)
   const config = await heroku.get(`/apps/${app.id}/config-vars`)

   let varList = 'Environment Variables:\n'
   for (const [key, value] of Object.entries(config)) {
    varList += `${key}: ${value}\n`
   }

   await message.reply(varList)
  } catch (error) {
   await message.reply(`Error: ${error.message}`)
  }
 }
)
bot(
 {
  pattern: 'dynorestart',
  fromMe: true,
  desc: 'Restart the Heroku dyno',
  type: 'heroku',
 },
 async (message) => {
  if (!(await checkHerokuConfig(message))) return

  try {
   await message.reply('Restarting dyno...')
   await heroku.delete(`/apps/${Config.HEROKU_APP_NAME}/dynos`)
   await message.reply('Dyno restarted successfully')
  } catch (error) {
   await message.reply(`Error: ${error.message}`)
  }
 }
)
