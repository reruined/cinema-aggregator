import fs from 'fs/promises'

const spegeln = JSON.parse(await fs.readFile('./json/shows-spegeln.json', { encoding: 'utf-8' }))
const panora = JSON.parse(await fs.readFile('./json/shows-panora.json', { encoding: 'utf-8' }))

function transformSpegeln(source) {
  const transformedData = source.data.map(entry => ({
    title: entry.title,
    date: new Date(entry.show_time),
    venue: 'Spegeln',
    screen: entry.screen_name
  }))
  
  return transformedData
}

function transformPanora(source) {
  const transformedData = source.film.reduce((array, entry) => {
    const showings = entry.forestall.map(showing => {
      const [day, month, year] = showing.Datum.split(/[\/\s]/)
      const [hour, minutes] = showing.Tid.split(':')
      const date = new Date(year, month, day, hour, minutes)
      return {
        title: entry.FilmNamn,
        date: date,
        venue: 'Panora',
        screen: showing.Salong
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

await fs.writeFile('./json/shows-all.json', JSON.stringify(shows, null, 2))