const config = require('../../config')
const { DataTypes } = require('sequelize')

// Define the JobDB model
const JobDB = config.DATABASE.define('jobs', {
 chat: {
  type: DataTypes.STRING,
  allowNull: false,
 },
 content: {
  type: DataTypes.TEXT,
  allowNull: false,
 },
})

/**
 * Updates or creates a job entry in the database.
 *
 * @param {string} chatId - The chat identifier.
 * @param {string|null} muteMessage - The message for mute action.
 * @param {string|null} muteTime - The time for mute action.
 * @param {string|null} unmuteMessage - The message for unmute action.
 * @param {string|null} unmuteTime - The time for unmute action.
 * @param {boolean} enabled - Indicates if the action is enabled or not.
 * @returns {Promise<boolean>} - Returns true if the operation is successful, otherwise false.
 */
exports.updateJob = async (chatId, muteMessage, muteTime, unmuteMessage, unmuteTime, enabled) => {
 try {
  // Fetch existing job records for the chatId
  const existingJobs = await JobDB.findAll({ where: { chat: chatId } })

  if (existingJobs.length === 1) {
   // If a job record exists, update it
   if (!muteMessage) {
    return false
   }

   const jobData = {
    mute: {
     time: muteTime || '',
     groupName: '',
     enabled: enabled || false,
     message: muteMessage || '',
    },
    unmute: {
     time: unmuteTime || '',
     groupName: '',
     enabled: enabled || false,
     message: unmuteMessage || '',
    },
   }

   await JobDB.update(
    {
     chat: chatId,
     content: JSON.stringify(jobData),
    },
    {
     where: { chat: chatId },
    }
   )

   return true
  } else {
   // If no job record exists, create a new one or update existing data
   const jobData = JSON.parse(existingJobs[0].content)
   jobData[muteMessage ? 'mute' : 'unmute'] = {
    time: muteTime || jobData[muteMessage ? 'mute' : 'unmute'].time,
    groupName: '',
    enabled: enabled || jobData[muteMessage ? 'mute' : 'unmute'].enabled,
    message: muteMessage || jobData[muteMessage ? 'mute' : 'unmute'].message,
   }

   await JobDB.update(
    {
     chat: chatId,
     content: JSON.stringify(jobData),
    },
    {
     where: { chat: chatId },
    }
   )

   return true
  }
 } catch (error) {
  console.error('Error updating job:', error)
  return false
 }
}

/**
 * Retrieves the job data for a specific chatId.
 *
 * @param {string} chatId - The chat identifier.
 * @param {string} key - The key to retrieve from the job data.
 * @returns {Promise<any>} - Returns the value associated with the key from job data or false if no job is found.
 */
exports.getJobData = async (chatId, key) => {
 try {
  // Fetch existing job records for the chatId
  const existingJobs = await JobDB.findAll({ where: { chat: chatId } })

  if (existingJobs.length === 1) {
   // Parse and return the specific key from the job data
   const jobData = JSON.parse(existingJobs[0].content)
   return jobData[key] || false
  }

  return false
 } catch (error) {
  console.error('Error retrieving job data:', error)
  return false
 }
}

/**
 * Retrieves all job records.
 *
 * @returns {Promise<Array>} - Returns an array of all job records.
 */
exports.getAllJobs = async () => {
 try {
  return await JobDB.findAll()
 } catch (error) {
  console.error('Error retrieving all jobs:', error)
  return []
 }
}
