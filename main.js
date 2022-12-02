require('./utils/getWeek.js')
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

hbs.registerHelper('todaysWeek', function() {
  return getToday().getWeek()
})

hbs.registerHelper('nextWeek', function() {
  return getNextWeek().getWeek()
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

const dateIsWeek = (week) => {
  const func = x => x.date.getWeek() === week
  return func
}

function getShowsByTitleOrderedByLastDate() {
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

  return showsByTitleOrderedByLastDate
}

function getToday() {
  const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)

  return today
}

function getTomorrow() {
  const today = new Date(Date.now())

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return tomorrow
}

function getNextWeek() {
  const today = new Date(Date.now())

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(0, 0, 0, 0)

  return nextWeek
}

const app = express()
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(path.join(__dirname, './public')))

app.get('/', (req, res) => {
  res.redirect('/shows')
})

app.get('/shows', (req, res) => {
  const query = req.query.query || ''

  const showsByTitleOrderedByLastDate = getShowsByTitleOrderedByLastDate()
  const showsFilteredByQuery = showsByTitleOrderedByLastDate.filter(titleIncludesString(query))

  res.render('index', {
    titles: showsFilteredByQuery,
    query: query
  })
})

app.get('/weeks/:week', (req, res) => {
  const week = req.params.week

  const showsByTitleOrderedByLastDate = getShowsByTitleOrderedByLastDate()
  const showsFilteredByWeek = showsByTitleOrderedByLastDate.filter(title => {
    return title.shows.find(x => x.date.getWeek() == week)
  })

  res.render('index', {
    titles: showsFilteredByWeek
  })
})

app.get('/today', (req, res) => {
  const today = getToday()
  const showsByTitleOrderedByLastDate = getShowsByTitleOrderedByLastDate()
  const showsFilteredByDay = showsByTitleOrderedByLastDate.filter(title => {
    return title.shows.find(x => {
      const date = new Date(x.date)
      date.setHours(0, 0, 0, 0)
      return date.getTime() === today.getTime()
    })
  })

  res.render('index', {
    titles: showsFilteredByDay
  })
})

app.get('/tomorrow', (req, res) => {
  const tomorrow = getTomorrow()
  const showsByTitleOrderedByLastDate = getShowsByTitleOrderedByLastDate()
  const showsFilteredByDay = showsByTitleOrderedByLastDate.filter(title => {
    return title.shows.find(x => {
      const date = new Date(x.date)
      date.setHours(0, 0, 0, 0)
      return date.getTime() === tomorrow.getTime()
    })
  })

  res.render('index', {
    titles: showsFilteredByDay
  })
})

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}...`)
})