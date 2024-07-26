const { Sequelize } = require('sequelize')
require('dotenv').config()
const toBool = (x) => x === 'true'
const DATABASE_URL = process.env.DATABASE_URL || './database.db'
module.exports = {
 SESSION_ID: process.env.SESSION_ID || '',
 SESSION_FLUSH: process.env.SESSION_FLUSH || 'false',
 OWNER_NAME: process.env.OWNER_NAME || 'MALIK-ʙᴏᴛs',
 BOT_NAME: process.env.BOT_NAME || 'MALIK-ʙᴏᴛ',
 SUDO: process.env.SUDO || '923263429027,923257853673,923030598402,923287340301,',
 WORK_TYPE: process.env.WORK_TYPE || 'private',
 TIME_ZONE: process.env.TZ || 'Africa/Lagos',
 HANDLERS: process.env.HANDLER || '.',
 ANTILINK: toBool(process.env.ANTI_LINK) || true,
 LOGS: toBool(process.env.LOGS) || true,
 ANTILINK_ACTION: process.env.ANTI_LINK || 'kick',
 AUTOMUTE_MSG: process.env.AUTOMUTE_MSG || '_Group automuted!_',
 AUTOUNMUTE_MSG: process.env.AUTOUNMUTE_MSG || '_Group autounmuted!_',
 LANG: process.env.LANG || 'EN',
 AUTH_TOKEN: '',
 RMBG_KEY: process.env.RMBG_KEY || false,
 BRANCH: 'main',
 WARN_COUNT: 3,
 PACKNAME: process.env.PACKNAME || 'ᴇx-ʙᴏᴛs',
 WELCOME_MSG: process.env.WELCOME_MSG || 'Hi @user Welcome to @gname',
 GOODBYE_MSG: process.env.GOODBYE_MSG || 'Hi @user It was Nice Seeing you',
 AUTHOR: process.env.AUTHOR || 'ᴇx-ʙᴏᴛs',
 HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
 HEROKU_API_KEY: process.env.HEROKU_API_KEY,
 HEROKU: toBool(process.env.HEROKU) || false,
 AUTO_READ: toBool(process.env.AUTO_READ) || false,
 AUTO_STATUS_READ: toBool(process.env.AUTO_STATUS_READ) || false,
 PROCESSNAME: process.env.PROCESSNAME || 'MALIK-ʙᴏᴛs',
 SESSION_URL: process.env.SESSION_URL || '',
 DELETED_LOG: toBool(process.env.DELETED_LOG) || false,
 DELETED_LOG_CHAT: process.env.DELETED_LOG_CHAT || false,
 REMOVEBG: process.env.REMOVEBG || false,
 DATABASE_URL: DATABASE_URL,
 STATUS_SAVER: toBool(process.env.STATUS_SAVER) || true,
 DATABASE:
  DATABASE_URL === './database.db'
   ? new Sequelize({
      dialect: 'sqlite',
      storage: DATABASE_URL,
      logging: false,
     })
   : new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      ssl: true,
      protocol: 'postgres',
      dialectOptions: {
       native: true,
       ssl: { require: true, rejectUnauthorized: false },
      },
      logging: false,
     }),
}
