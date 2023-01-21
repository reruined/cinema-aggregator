import fs from 'fs/promises'

const spegeln = JSON.parse(await fs.readFile('./json/shows-spegeln.json', { encoding: 'utf-8' }))
const panora = JSON.parse(await fs.readFile('./json/shows-panora.json', { encoding: 'utf-8' }))

function transformSpegeln(source) {
  const transformedData = source.data.map(entry => ({
    title: entry.title,
    date: new Date(entry.show_time),
    venue: 'Spegeln',
    screen: entry.screen_name,
    poster: `https://biografspegeln.se/media/posters/${entry.movie_id}/216/${entry.movie_poster}`,
    link: `https://biografspegeln.se/#/movie/${entry.movie_id}`
  }))
  
  return transformedData
}

function transformPanora(source) {
  const transformedData = source.film.reduce((array, entry) => {
    const showings = entry.forestall.map(showing => {
      const [day, month, year] = showing.Datum.split(/[\/\s]/)
      const [hour, minutes] = showing.Tid.split(':')

      // CAUTION: the month is 0-indexed
      const date = new Date(year, month - 1, day, hour, minutes)

      /*
      if(entry.FilmNamn.toLowerCase().includes('boy from heaven')) {
        console.log(entry.FilmNamn)
        console.log(`\tDatum: ${showing.Datum}`)
        console.log(`\tTid: ${showing.Tid}`)
        console.log(`\tyear: ${year}, month: ${month}, day: ${day}, hour: ${hour}, minutes: ${minutes}`)
        console.log(`\tdate: ${date}`)
      }
      */

      return {
        title: entry.FilmNamn,
        date: date,
        venue: 'Panora',
        screen: showing.Salong,
        poster: entry.BildSokvag,
        link: `https://www.panora.se/?s=${encodeURIComponent(entry.FilmNamn)}`
      }
    })
    return array.concat(showings)
  }, [])
  
  return transformedData
}

const shows = [].concat(
  transformSpegeln(spegeln),
  transformPanora(panora)
)

const output = {
  shows: shows,
  date: new Date()
}

await fs.writeFile('./json/shows-all.json', JSON.stringify(output, null, 2))