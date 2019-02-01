// Put all the javascript code here, that you want to execute after page load.

/* global $ */

const KEY_ID = 'kvb'

// storage
function storage () {
  function get (key) {
    const item = window.localStorage.getItem(key) || '[]'
    return new Set(JSON.parse(item))
  }

  function set (key, item) {
    window.localStorage.setItem(key, JSON.stringify(Array.from(item)))
  }

  function add (key, value) {
    const item = get(key)
    item.add(value)
    set(key, item)
  }

  function remove (key, value) {
    const item = get(key)
    item.delete(value)
    if (item.size) set(key, item)
    else window.localStorage.removeItem(key)
  }

  function keys () {
    const keys = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key.startsWith(KEY_ID)) keys.push(key)
    }
    return keys
  }

  function items () {
    return keys().map(key => ({
      key,
      value: JSON.parse(window.localStorage.getItem(key)).map(item =>
        JSON.parse(item)
      )
    }))
  }

  function clear () {
    keys().forEach(key => {
      window.localStorage.removeItem(key)
    })
  }

  return { add, remove, items, clear }
}

// const names = window.location.pathname.split('/')
// const stem = names[names.length - 1]
const stem = window.location.pathname.split('/').pop()
const word = $('section#block-system-main > h1')
  .text()
  .replace(/\u00AD/g, '')

const section = $('h2:contains("Bedeutungsübersicht")').parents('section')

section.find('div.entry').each((_, entry) => {
  const clone = $(entry).clone()
  clone.find('figure').remove()
  clone.find('.term-section').remove()
  const definition = clone.text().trim()

  $(entry)
    .find('.term-section')
    .each((_, el) => {
      const b = $(el).find('h3:contains("Beispiel") + span')
      b.prepend(
        $('<input type="checkbox" />').data('kvb', {
          definition,
          example: b.text().trim()
        })
      )

      const w = $(el).find(
        'h3:contains("Wendungen, Redensarten, Sprichwörter") + span'
      )
      const clone = w.parent().clone()
      clone.find('h3').remove()
      w.prepend(
        $('<input type="checkbox" />').data('kvb', {
          definition,
          example: clone.text().trim()
        })
      )

      $(el)
        .find('ul > li')
        .each((_, li) => {
          const example = $(li)
            .text()
            .trim()
          $(li).prepend(
            $('<input type="checkbox" />').data('kvb', {
              definition,
              example
            })
          )
        })
    })
})

section.find('ol > li > a').each((_, a) => {
  const definition = $(a)
    .text()
    .trim()
  const href = $(a).attr('href')
  // $(href).prepend('<input type="checkbox" />')
  $(href)
    .find('.term-section')
    .each((_, el) => {
      const b = $(el).find('h3:contains("Beispiel") + span')
      b.prepend(
        $('<input type="checkbox" />').data('kvb', {
          definition,
          example: b.text().trim()
        })
      )

      const w = $(el).find(
        'h3:contains("Wendungen, Redensarten, Sprichwörter") + span'
      )
      const clone = w.parent().clone()
      clone.find('h3').remove()
      w.prepend(
        $('<input type="checkbox" />').data('kvb', {
          definition,
          example: clone.text().trim()
        })
      )

      $(el)
        .find('ul > li')
        .each((_, li) => {
          const example = $(li)
            .text()
            .trim()
          $(li).prepend(
            $('<input type="checkbox" />').data('kvb', {
              definition,
              example
            })
          )
        })
    })
})

const s = storage()

$('input:checkbox').click(event => {
  const data = $(event.target).data('kvb')
  const key = KEY_ID + '-' + stem
  const value = JSON.stringify(Object.assign({ word }, data))
  console.log(key, value)
  if (event.target.checked) s.add(key, value)
  else s.remove(key, value)
})

const save = $('<button>Save</button>').click(() => {
  // console.log(s.items())
  const items = [].concat(...s.items().map(item => item.value))
  // console.log(items)
  const csv = new CsvWriter()
  const encodedUri =
    'data:text/csv;charset=utf-8,' +
    encodeURIComponent(csv.arrayToCSV(items.map(item => Object.values(item))))

  const w = window.open(null, 'CSV')
  w.location.href = encodedUri

  // $('input:checked').each((_, el) => {
  //   $(el).click()
  // })
  // s.clear()
})

$('body').prepend(save)

// CSV Writer
function CsvWriter (del, enc) {
  this.del = del || ',' // CSV Delimiter
  this.enc = enc || '"' // CSV Enclosure

  // Convert Object to CSV column
  this.escapeCol = function (col) {
    if (isNaN(col)) {
      // is not boolean or numeric
      if (!col) {
        // is null or undefined
        col = ''
      } else {
        // is string or object
        col = String(col)
        if (col.length > 0) {
          // use regex to test for del, enc, \r or \n
          // if(new RegExp( '[' + this.del + this.enc + '\r\n]' ).test(col)) {

          // escape inline enclosure
          col = col.split(this.enc).join(this.enc + this.enc)

          // wrap with enclosure
          col = this.enc + col + this.enc
        }
      }
    }
    return col
  }

  // Convert an Array of columns into an escaped CSV row
  this.arrayToRow = function (arr) {
    var arr2 = arr.slice(0)

    var i

    var ii = arr2.length
    for (i = 0; i < ii; i++) {
      arr2[i] = this.escapeCol(arr2[i])
    }
    return arr2.join(this.del)
  }

  // Convert a two-dimensional Array into an escaped multi-row CSV
  this.arrayToCSV = function (arr) {
    var arr2 = arr.slice(0)

    var i

    var ii = arr2.length
    for (i = 0; i < ii; i++) {
      arr2[i] = this.arrayToRow(arr2[i])
    }
    return arr2.join('\r\n')
  }
}
