const V = process.argv[2]==='-v'
let timer = (_=>{
  const toF = array => parseFloat(array.join('.'))
  const trim = n=>(''+n).slice(0,4)
  let start = toF(process.hrtime())
  let lasttime = start
  let lastname = 'start'
  return name => {
    let now = toF(process.hrtime())
    let sincelast = now-lasttime
    let sincestart = now-start 

    console.log(name+"!\nit's been "+trim(sincelast)+'s since '+lastname+'\nand '+trim(sincestart)+' since the start')
    lasttime = now
    lastname = name||'unknown'
  }
})()
var jsdom = require('jsdom')
var fs = require('fs')
var CT = require('./lib.js')

var generateTable = (table,title="untitled",weekend,window) => {

  var TIMETABLE_HEAD = table.children[0].children[weekend]
  var TIMETABLE_BODY = table.children[1]
  var APM = Array.prototype.map

  var stationObject = row => {
    var name = row.children[1+weekend].textContent.replace(/\s+/g," ")
    var zone = parseInt(row.children[0+weekend].textContent)
    return {name:name,zone:zone}
  }
  var STATIONS = APM.call(TIMETABLE_BODY.children, stationObject)
  var KEYS = APM.call(TIMETABLE_HEAD.children, col=>parseInt(col.textContent.match(/\d+/)))
  var TRASH_KEYS = KEYS.map(x=>!x)
  var removeTrash = array => TRASH_KEYS.map((tr,i)=>tr?null:array[i]).filter(x=>x!==null) 
  KEYS = removeTrash(KEYS)
  var timeObject = cell => {
    var isPM = window.getComputedStyle(cell)['font-weight']==='bold'?12*60*60*1000:0
    var time = /(\d+):(\d+)/.exec(cell.textContent)
    if (time){
      var hours = parseInt(time[1])*60*60*1000
      var minutes = parseInt(time[2])*60*1000
      var ms = time[1]==='12'&&isPM?hours+minutes:hours+minutes+isPM
      return ms
    }else{
      return false
    }
  }
  var TIMETABLE = APM.call(TIMETABLE_BODY.children, row=>APM.call(row.children,timeObject))
  TIMETABLE = TIMETABLE.map(removeTrash)
  return {name:title,trains:KEYS,stations:STATIONS,times:TIMETABLE}
}

var tables = []
var manydone = x => {
  let i = 0
  return _ => {
    i++
    i >= x ? fs.writeFileSync('timetable.json', JSON.stringify(tables)):null
    V?timer('returned',i):null
  }
}
var bothdone = manydone(2)
V?timer('end declarations'):null

jsdom.env(
  'http://www.caltrain.com/schedules/weekdaytimetable.html', [],
  function (err, window) {
    V?timer("Got weekday timetable."):null

    var document = window.document
    var SBTABLE = document.querySelector(".SB_TT")
    var SB = generateTable(SBTABLE,'S', 0, window)
    var NBTABLE = document.querySelector(".NB_TT")
    var NB = generateTable(NBTABLE,'N', 0, window)
    tables.push(NB,SB)
    bothdone()
    //fs.writeFileSync('weekday.json', JSON.stringify([NB,SB]))
  })
V?timer('asked for weekday'):null
jsdom.env(
  'http://www.caltrain.com/schedules/weekend-timetable.html', [],
  function (err, window) {
    V?timer("Got weekend timetable."):null

    var document = window.document
    var SBTABLE = document.querySelector(".SB_TT")
    var SB = generateTable(SBTABLE,'SW', 1, window)
    var NBTABLE = document.querySelector(".NB_TT")
    var NB = generateTable(NBTABLE,'NW', 1, window)
    tables.push(NB,SB)
    bothdone()
    //fs.writeFileSync('weekday.json', JSON.stringify([NB,SB]))
  })
V?timer('asked for weekend'):null
