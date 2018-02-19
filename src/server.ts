
import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import { join } from 'path'
import ms = require('ms')

const isProduction = false
const port = process.env.PORT || 3000

const staticOptions = {
  maxAge: isProduction ? ms('1yr') : ms('0'),
  setHeaders: (res: express.Response, path: any) => {
    res.setHeader('Expires', isProduction
      ? new Date(Date.now() + ms('1yr')).toUTCString()
      : new Date(Date.now() + ms('0')).toUTCString())
  }
}

const app = express()
const shrinkRay = require('shrink-ray')
const minify = require('express-minify')
const bodyParser = require('body-parser')
const minifyHTML = require('express-minify-html')

app.use(shrinkRay())
app.set('etag', isProduction)
app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(minify())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(minifyHTML({
  override: true,
  exception_url: false,
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: false,
    minifyJS: true
  }
}))
app.use(minify({
  cache: false,
  uglifyJsModule: null,
  errorHandler: null,
  jsMatch: /javascript/,
  cssMatch: /css/,
  jsonMatch: /json/,
  sassMatch: /scss/
}))

app.use(express.static(join(__dirname, '/../dist'), staticOptions))

app.get('/', (req, res) => {
  res.render('index', { title: 'Instant OMDB', description: '' })
})

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Instant OMDB', description: 'This app demos how one could an instance search of the Open Movie Database' })
})

app.listen(port, () => {
  console.log('Example app listening on port 3000!')
})

