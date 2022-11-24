import fs from 'fs/promises'

const spegeln = JSON.parse(await fs.readFile('./spegeln.json', { encoding: 'utf-8' }))
const panora = JSON.parse(await fs.readFile('./panora.json', { encoding: 'utf-8' }))

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

function aggregate(sources, query) {
  const shows = [].concat(...sources)
  console.log(shows.find(x => x.title.toLowerCase().includes(query)).title)
  console.log(
    shows
      .filter(x => x.title.toLowerCase().includes(query))
      .sort(x => x.date)
      .map( x => ({ ...x, date: `${ x.date.toLocaleDateString() } ${ x.date.toLocaleTimeString() }` }) )
      .map(x => `${x.screen} at ${x.venue}, ${x.date}`)
    )
}

const query = 'maigret'
aggregate([
  transformSpegeln(spegeln),
  transformPanora(panora)
], query)
