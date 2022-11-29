const express = require('express')
const path = require('path')
const listings = require('./json/listings-all.json')

const PORT = 3000

const app = express()
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(path.join(__dirname, './public')))

app.get('/', (req, res) => {
  const titles = listings
    .map(listing => listing.title)
    .filter((title, index, array) => array.findIndex(x => x.toLowerCase() === title.toLowerCase()) === index)
    .sort()
    .map(title => {
      const listingsForTitle = listings
        .filter(x => x.title.toLowerCase() === title.toLowerCase())
        .sort(x => x.date)
        .slice(0, 5)
        .map(x => ({...x, date: new Date(x.date)}))
        .map(x => ({...x, date: `${ x.date.toLocaleDateString('se') } ${ x.date.toLocaleTimeString('se').slice(0, -3) }`}))
      return {
        title,
        listings: listingsForTitle
      }
    })

  console.log(`${titles.length} records`)
  
  res.render('index', {
    titles
  })
})

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}...`)
})