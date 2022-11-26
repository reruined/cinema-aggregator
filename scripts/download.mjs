import fetch from 'node-fetch'
import fs from 'fs/promises'

async function download(url, destination) {
  console.log(`'${url}': downloading...`)
  const res = await fetch(url)
  const data = await res.json()
  console.log(`'${res.url}': ${res.status} ${res.statusText}`)

  console.log(`'${url}': writing to '${destination}'...`)
  await fs.writeFile(destination, JSON.stringify(data, null, 2))
  console.log(`'${url}': complete`)
}

try {
  console.log('download.js: START')
  await Promise.allSettled([
    download('https://biografspegeln.se/webservices/show_times/getContent?cinema_id=1&content_id=6', './listings-spegeln.json'),
    download('https://panora.internetbokningen.com/chap/ajax/getAllMovies', './listings-panora.json')
  ])
}
catch(e) {
  console.error(e)
}
finally {
  console.log('download.js: END')
}
