
var jsdom = require('jsdom')
var fs = require('fs')
var CT = require('./lib.js')

jsdom.env(
  'http://www.caltrain.com/schedules/weekdaytimetable.html', [],
  function (err, window) {
    const generateTable = (table,title="untitled") => {

      const TIMETABLE_HEAD = table.children[0].children[0]
      const TIMETABLE_BODY = table.children[1]
      const APM = Array.prototype.map

      const stationObject = row => {
        const name = row.children[1].textContent.replace(/\s+/g," ")
        const zone = parseInt(row.children[0].textContent)
        return {name:name,zone:zone}
      }
      let STATIONS = APM.call(TIMETABLE_BODY.children, stationObject)
      let KEYS = APM.call(TIMETABLE_HEAD.children, col=>parseInt(col.textContent.match(/\d+/)))
      let TRASH_KEYS = KEYS.map(x=>!x)
      let removeTrash = array => TRASH_KEYS.map((tr,i)=>tr?null:array[i]).filter(x=>x!==null) 
      KEYS = removeTrash(KEYS)
      const timeObject = cell => {
        const isPM = window.getComputedStyle(cell)['font-weight']==='bold'?12*60*60*1000:0
        const time = /(\d+):(\d+)/.exec(cell.textContent)
        if (time){
          const hours = parseInt(time[1])*60*60*1000
          const minutes = parseInt(time[2])*60*1000
          const ms = time[1]==='12'&&isPM?hours+minutes:hours+minutes+isPM
          return ms
        }else{
          return false
        }
      }
      let TIMETABLE = APM.call(TIMETABLE_BODY.children, row=>APM.call(row.children,timeObject))
      TIMETABLE = TIMETABLE.map(removeTrash)
      return {name:title,trains:KEYS,stations:STATIONS,times:TIMETABLE}
    }

    var document = window.document
    const SBTABLE = document.querySelector(".SB_TT")
    let SB = generateTable(SBTABLE,'S')
    const NBTABLE = document.querySelector(".NB_TT")
    let NB = generateTable(NBTABLE,'N')
    fs.writeFileSync('weekday.json', JSON.stringify([NB,SB]))
  })
