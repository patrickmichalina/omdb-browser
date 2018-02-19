const most = (window as any).most
const IMG_PLACEHOLDER = 'https://www.surefitlab.com/media/catalog/product/cache/3/image/500x/8bffd1f41f6037eb62ae19998042eea4/placeholder/default/Image_Missing_placeholder.jpg'
const API = 'https://www.omdbapi.com/?apikey=aba065d3'
const MAIN_ID = 'results'
const DEBOUNCE = 150
const COLUMNS = 4

const resultContainer = document.createElement('main')
resultContainer.id = MAIN_ID
document.body.appendChild(resultContainer)
initModal()

const getMain = () => {
  return document.querySelector(`#${MAIN_ID}`)
}

const searchMovieDb = (query: string) => {
  return most.fromPromise(fetch(`${API}&s=${query}`).then(a => a.json()))
}

const getMovie = (imdbId: string) => {
  return most.fromPromise(fetch(`${API}&i=${imdbId}`).then(a => a.json()))
}

const renderMovies = (searchResults: any[]) => {
  getMain().innerHTML = searchResults[0].Title
}

const renderError = (error: string) => {
  getMain().innerHTML = error
}

const renderMain = (node: Element) => {
  const main = getMain()
  while (main.firstChild) {
    main.removeChild(main.firstChild)
  }
  main.appendChild(node)
}

function modal() {
  return document.getElementById('modal')
}

function initModal() {
  const modalCloseButton = document.getElementsByClassName("close")[0]
  window.addEventListener('click', hideModal)
}

function showModal(movie: any) {
  const _modal = modal()
  const content = _modal.querySelector('.modal-content')
  content.innerHTML = ''
  _modal.style.display = "block"
  Object.keys(movie).map(key => {
    const div = document.createElement('div')
    const label = document.createElement('label')
    const p = document.createElement('p')
    label.htmlFor = key
    label.textContent = key
    p.id = key
    p.textContent = movie[key]
    div.appendChild(label) 
    div.appendChild(p) 
    return div
  }).forEach(div => content.appendChild(div))
}

function hideModal() {
  modal().style.display = "none"
}

function createMovie(title: any) {
  const movieContainer = document.createElement('article')
  movieContainer.classList.add('fade-in', 'tooltip')
  const h1 = document.createElement('h1')
  const img = document.createElement('img')
  const type = document.createElement('p')
  const details = document.createElement('div')
  img.src = title.Poster !== 'N/A' ? title.Poster : IMG_PLACEHOLDER
  h1.textContent = title.Title
  type.textContent = title.Type;
  [img, h1, type, details].forEach(node => movieContainer.appendChild(node))

  most
    .fromEvent('click', movieContainer)
    .map(() => title.imdbID)
    .flatMap(getMovie)
    .observe(showModal)

  return movieContainer
}

const createMovies = (movies: any[]) => {
  return movies.map(createMovie)
}

function createSection(movieElements: HTMLElement[]) {
  const section = document.createElement('section')
  movieElements.forEach(a => section.appendChild(a))
  return section
}

function skipEquals(a, b) {
  return a.toLowerCase() === b.toLowerCase()
}

const inputElement = document.querySelector('#search') as HTMLInputElement // assuming this exists from server
const search_ = most
  .fromEvent('keyup', inputElement)
  .debounce(DEBOUNCE)
  .map(evt => evt.srcElement.value)
  .skipRepeatsWith(skipEquals)
  .flatMap(searchMovieDb)
  .multicast()

const searchResults_ = search_
  .filter(a => a.Response === 'True')
  .map(a => a.Search)
  .map(createMovies)
  .map(createSection)
  .observe(renderMain)

const searchErrors_ = search_
  .filter(a => a.Response === 'False')
  .map(a => a.Error)
  .observe(renderError)
