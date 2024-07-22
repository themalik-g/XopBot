const fs = require('fs-extra')
const { unlink } = require('fs').promises
const axios = require('axios')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const util = require('util')
const child_process = require('child_process')
const jimp = require('jimp')

const unixTimestampSecond = (date = new Date()) => Math.floor(date.getTime() / 1000)

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const isUrl = url => {
 const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi
 return url.match(urlRegex)
}

const generateMessageTag = suffix => {
 let tag = unixTimestampSecond().toString()
 if (suffix) {
  tag += `.--${suffix}`
 }
 return tag
}

const processTime = (timestamp, now) => {
 return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

const getBuffer = async (url, options = {}, method = 'get') => {
 try {
  if (Buffer.isBuffer(url)) return url
  if (/^https?:\/\//i.test(url)) {
   const response = await axios({
    method,
    url,
    headers: { DNT: 1, 'Upgrade-Insecure-Request': 1 },
    ...options,
    responseType: 'arraybuffer',
   })
   return response.data
  }
  if (fs.existsSync(url)) return fs.readFileSync(url)
  return url
 } catch (error) {
  console.error('Error while getting buffer:', error)
  return false
 }
}

const fetchJson = async (url, options = {}, method = 'GET') => {
 try {
  const response = await axios({
   method,
   url,
   headers: {
    'User-Agent':
     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
   },
   ...options,
  })
  return response.data
 } catch (error) {
  console.error('Error while fetching JSON:', error)
  return false
 }
}

const runtime = (seconds, dText = ' d', hText = ' h', mText = ' m', sText = ' s') => {
 const days = Math.floor(seconds / 86400)
 const hours = Math.floor((seconds % 86400) / 3600)
 const minutes = Math.floor((seconds % 3600) / 60)
 const secs = Math.floor(seconds % 60)

 const parts = [
  days > 0 ? `${days}${dText}` : '',
  hours > 0 ? `${hours}${hText}` : '',
  minutes > 0 ? `${minutes}${mText}` : '',
  secs > 0 ? `${secs}${sText}` : '',
 ]

 return parts.filter(Boolean).join(', ')
}

const clockString = ms => {
 const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
 const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
 const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
 return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const getTime = (format, date) => {
 const timezone = global.timezone || 'Asia/Karachi'
 return date ? moment.tz(date, timezone).format(format) : moment.tz(timezone).format(format)
}

const formatDate = (date, locale = 'id') => {
 return new Date(date).toLocaleDateString(locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
 })
}

const formatp = sizeFormatter({
 std: 'JEDEC',
 decimalPlaces: 2,
 keepTrailingZeroes: false,
 render: (literal, symbol) => `${literal} ${symbol}B`,
})

const jsonformat = obj => JSON.stringify(obj, null, 2)

const logic = (check, inp, out) => {
 if (inp.length !== out.length) throw new Error('Input and Output must have same length')
 for (let i in inp) {
  if (util.isDeepStrictEqual(check, inp[i])) return out[i]
 }
 return null
}

const bytesToSize = (bytes, decimals = 2) => {
 if (bytes === 0) return '0 Bytes'
 const k = 1024
 const dm = decimals < 0 ? 0 : decimals
 const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
 const i = Math.floor(Math.log(bytes) / Math.log(k))
 return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const getSizeMedia = path => {
 return new Promise((resolve, reject) => {
  if (/http/.test(path)) {
   axios.get(path).then(res => {
    let length = parseInt(res.headers['content-length'])
    let size = exports.bytesToSize(length, 3)
    if (!isNaN(length)) resolve(size)
   })
  } else if (Buffer.isBuffer(path)) {
   let length = Buffer.byteLength(path)
   let size = exports.bytesToSize(length, 3)
   if (!isNaN(length)) resolve(size)
  } else reject('Error: Unsupported path type')
 })
}

const parseMention = (text = '') => {
 return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

const GIFBufferToVideoBuffer = async image => {
 const filename = `${Math.random().toString(36).substring(2)}.gif`
 await fs.writeFileSync(`./${filename}`, image)

 child_process.exec(
  `ffmpeg -i ./${filename} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./${filename}.mp4`
 )
 await sleep(4000)

 var buffer = await fs.readFileSync(`./${filename}.mp4`)
 Promise.all([unlink(`./${filename}.mp4`), unlink(`./${filename}`)])
 return buffer
}

const generateProfilePicture = async imagePath => {
 const image = await jimp.read(imagePath)
 const imageWidth = image.getWidth()
 const imageHeight = image.getHeight()
 const croppedImage = image.crop(0, 0, imageWidth, imageHeight)

 const scaledImageBuffer = await croppedImage.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG)

 return {
  img: scaledImageBuffer,
  preview: scaledImageBuffer,
 }
}

module.exports = {
 unixTimestampSecond,
 sleep,
 isUrl,
 generateMessageTag,
 processTime,
 getBuffer,
 fetchJson,
 runtime,
 clockString,
 getTime,
 formatDate,
 formatp,
 jsonformat,
 logic,
 bytesToSize,
 getSizeMedia,
 parseMention,
 GIFBufferToVideoBuffer,
 generateProfilePicture,
}

// Watch for file changes
const file = require.resolve(__filename)
fs.watchFile(file, () => {
 console.log(`Update ${__filename}`)
 fs.unwatchFile(file)
 delete require.cache[file]
 require(file)
})