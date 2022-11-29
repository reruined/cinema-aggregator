const express = require('express')
const path = require('path')
const listings = require('./json/listings-all.json')

const PORT = 3000

function getTitles(query, maxListings) {
  let titles = listings
  .map(listing => listing.title)
  .filter((title, index, array) => array.findIndex(x => x.toLowerCase() === title.toLowerCase()) === index)
  .sort()
  .map(title => {
    let listingsForTitle = listings
      .filter(x => x.title.toLowerCase() === title.toLowerCase())
      .sort(x => x.date)
      .map(x => ({...x, date: new Date(x.date)}))
      .map(x => ({...x, date: `${ x.date.toLocaleDateString('se') } ${ x.date.toLocaleTimeString('se').slice(0, -3) }`}))

    if(maxListings) {
      const count = listingsForTitle.length
      listingsForTitle = listingsForTitle.slice(0, maxListings)

      if(listingsForTitle.length < count) {
        listingsForTitle.push({ date: 'More...' })
      }
    }
    return {
      title,
      url: encodeURIComponent(title),
      listings: listingsForTitle
    }
  })

  if(query) {
    titles = titles.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
  }

  return titles
}

const app = express()
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(path.join(__dirname, './public')))

app.get('/', (req, res) => {
  console.log(req.query)

  const query = req.query.query
  const titles = query ? getTitles(query) : getTitles(null, 3)
  res.render('index', {
    titles,
    query
  })
})

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}...`)
})