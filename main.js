const express = require('express')
const path = require('path')
const hbs = require('hbs')
const showsJson = require('./json/shows-all.json')

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
  res.redirect('/shows')
})

app.get('/shows', (req, res) => {
  const showsOrderedByDateAsc = showsJson
    .slice()
    .map(parseDateAsObject)
    .sort(compareByDate)

  const showsByTitle = showsOrderedByDateAsc
    .map(getTitleProperty)
    .filter(isUnique)
    .map(title => {
      const showsForTitle = showsOrderedByDateAsc
        .filter(filterByTitle(title))
        .map(removeTitleProperty)

      return {
        title: title,
        shows: showsForTitle,
        url: encodeURIComponent(title)
      }
    })

  const showsByTitleOrderedByLastDate = showsByTitle
    .sort((a, b) => {
      const lastDateA = a.shows[a.shows.length - 1].date
      const lastDateB = b.shows[b.shows.length - 1].date
      return lastDateA - lastDateB
    })

  const query = req.query.query || ''
  const showsFilteredByQuery = showsByTitleOrderedByLastDate.filter(titleIncludesString(query))

  res.render('index', {
    titles: showsFilteredByQuery,
    query: query
  })
})


app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}...`)
})