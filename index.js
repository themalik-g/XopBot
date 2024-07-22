const fs = require('fs').promises // Use promises API for async operations
const path = require('path')
const config = require('./config')
const connect = require('./lib/connection')
const { loadSession } = require('baileys')
const io = require('socket.io-client')
const { getandRequirePlugins } = require('./lib/database/plugins')
const { makeSession } = require('./lib/makeSession')

global.__basedir = __dirname // Set the base directory for the project

const readAndRequireFiles = async (directory) => {
 try {
  const files = await fs.readdir(directory)
  return Promise.all(files.filter((file) => path.extname(file).toLowerCase() === '.js').map((file) => require(path.join(directory, file))))
 } catch (error) {
  console.error('Error reading and requiring files:', error)
  throw error
 }
}

async function initialize() {
 console.log('ZENON-BOT')
 await makeSession()
 try {
  if (
   config.SESSION_ID &&
   !(await fs
    .access('session')
    .then(() => false)
    .catch(() => true))
  ) {
   console.log('Loading session from session id...')
   await fs.mkdir('./lib/auth', { recursive: true }) // Create directory if it doesn't exist
   const credsData = await loadSession(config.SESSION_ID)
   await fs.writeFile('./lib/auth/creds.json', JSON.stringify(credsData.creds, null, 2))
  }
  await readAndRequireFiles(path.join(__dirname, '/lib/database/'))
  console.log('Syncing Database')

  await config.DATABASE.sync()

  console.log('⬇  Installing Plugins...')
  await readAndRequireFiles(path.join(__dirname, '/plugins/'))
  await getandRequirePlugins()
  console.log('✅ Plugins Installed!')

  const ws = io('https://socket.xasena.me/', { reconnection: true })
  ws.on('connect', () => console.log('Connected to server'))
  ws.on('disconnect', () => console.log('Disconnected from server'))

  return await connect()
 } catch (error) {
  console.error('Initialization error:', error)
  process.exit(1) // Exit with error status
 }
}

initialize()
