const { SESSION_ID } = require('../config')
const fs = require('fs')
const path = require('path')

const DEFAULT_DIRECTORY = '/auth/'

/**
 * Decodes a Base64 encoded string to UTF-8.
 * @param {string} base64String - The Base64 encoded string.
 * @returns {string} - The decoded UTF-8 string.
 */
function decodeBase64(base64String) {
 return Buffer.from(base64String, 'base64').toString('utf-8')
}

/**
 * Creates a session directory and saves credentials.
 * @param {string} [sessionId=SESSION_ID] - The session ID to decode.
 * @param {string} [directoryPath=path.join(__dirname, DEFAULT_DIRECTORY)] - The directory where credentials will be saved.
 * @param {boolean} [forceCreate=false] - Flag to force creation of the directory.
 */
async function makeSession(sessionId = SESSION_ID, directoryPath = path.join(__dirname, DEFAULT_DIRECTORY), forceCreate = false) {
 // Sanitize the session ID
 const sanitizedSessionId = String(sessionId)
  .replace(/^SESSION_\d{2}_\d{2}_\d{2}_\d{2}_/i, '')
  .replace(/Ex&/i, '')
  .trim()

 // Ensure the directory exists
 if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true })
 }

 try {
  console.log('Checking Session ID!')

  // Decode and parse the credentials
  const credentials = decodeBase64(sanitizedSessionId)
  console.log('Decoded credentials:', credentials)

  let parsedCredentials
  try {
   parsedCredentials = JSON.parse(credentials)
  } catch (jsonError) {
   console.error('Error parsing JSON:', jsonError)
   return
  }

  // Save the credentials to the directory
  if (parsedCredentials['creds.json']) {
   for (const [fileName, fileContent] of Object.entries(parsedCredentials)) {
    try {
     const filePath = path.join(directoryPath, fileName)
     const contentToWrite = typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent, null, 2)
     fs.writeFileSync(filePath, contentToWrite)
    } catch (writeError) {
     console.error('Error writing file:', fileName, writeError)
    }
   }
  } else {
   fs.writeFileSync(path.join(directoryPath, 'creds.json'), JSON.stringify(parsedCredentials, null, 2))
  }

  console.log('Credentials saved successfully.')
 } catch (error) {
  console.error('Error:', error)
 }
}

makeSession()

module.exports = { makeSession }
