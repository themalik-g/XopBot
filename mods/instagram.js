const fetch = require('node-fetch')

function insta(url) {
 return new Promise(async (resolve, reject) => {
  try {
   const BASE_URL = 'https://cobalt.tools'
   const BASE_API = 'https://api.cobalt.tools/api'

   await fetch(`${BASE_API}/json`, {
    method: 'OPTIONS',
    headers: {
     'access-control-request-method': 'POST',
     'access-control-request-headers': 'content-type',
     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
     origin: BASE_URL,
     referer: BASE_URL,
    },
   })

   const response = await fetch(`${BASE_API}/json`, {
    method: 'POST',
    headers: {
     origin: BASE_URL,
     referer: BASE_URL,
     'user-agent': BASE_URL,
     'content-type': 'application/json',
     accept: 'application/json',
    },
    body: JSON.stringify({
     url: url,
     filenamePattern: 'basic',
    }),
   }).then((res) => res.json())

   const stream = await fetch(response.url)
   if (!stream.ok) return reject('Download Failed!')
   return resolve(stream)
  } catch (error) {
   reject(error)
  }
 })
}

// Example usage
/*
insta('your-social-media-link')
 .then((stream) => console.log(stream))
 .catch((error) => console.error(error))
*/
module.exports = insta
