const express = require('express')
const path = require('path')
const hbs = require('hbs')
const listingsJson = require('./json/listings-all.json')

const PORT = 3000

hbs.registerHelper('firstThree', function(array) {
  return array.slice(0, 3)
})

hbs.registerHelper('defined', function(x) {
  return Boolean(x)
})

hbs.registerHelper('formatDate', function(x) {
  const date = new Date(x)
  return `${ date.toLocaleDateString('se') } ${ date.toLocaleTimeString('se').slice(0, -3) }`
})


const parseDateAsObject = x => {
  x.date = new Date(x.date)
  return x
}

const compareByDate = (a, b) => {
  return a.date - b.date
}

const getTitleProperty = (x) => {
  return x.title
}

const removeTitleProperty = (x) => {
  const obj = {...x}
  delete obj.title
  return obj
}

const isUnique = (x, i, array) => {
  return array.findIndex(y => x.toLowerCase() === y.toLowerCase()) === i
}

const filterByTitle = (title) => {
  const func = x => x.title.toLowerCase() === title.toLowerCase()
  return func
}

const titleIncludesString = (str) => {
  const func = x => x.title.toLowerCase().includes(str.toLowerCase())
  return func
}

const app = express()
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(path.join(__dirname, './public')))

app.get('/', (req, res) => {
  const listingsOrderedByDateAsc = listingsJson
    .slice()
    .map(parseDateAsObject)
    .sort(compareByDate)

  const listingsByTitle = listingsOrderedByDateAsc
    .map(getTitleProperty)
    .filter(isUnique)
    .map(title => {
      const listingsForTitle = listingsOrderedByDateAsc
        .filter(filterByTitle(title))
        .map(removeTitleProperty)

      return {
        title: title,
        listings: listingsForTitle,
        url: encodeURIComponent(title)
      }
    })

  // const listingsByTitleOrderedByLastDate
  const listingsByTitleOrderedByLastDate = listingsByTitle
    .sort((a, b) => {
      const lastDateA = a.listings[a.listings.length - 1].date
      const lastDateB = b.listings[b.listings.length - 1].date
      return lastDateA - lastDateB
    })

  const query = req.query.query || ''
  const listingsFilteredByQuery = listingsByTitleOrderedByLastDate.filter(titleIncludesString(query))

  res.render('index', {
    titles: listingsFilteredByQuery,
    query: query
  })
})


app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}...`)
})