const engine = 'https://www.duden.de/suchen/dudenonline/'

window.addEventListener('dblclick', function () {
  var selection =
    window.getSelection() ||
    document.getSelection() ||
    document.selection.createRange()
  var link = engine + selection
  console.log(link)
  window.open(link)
})
