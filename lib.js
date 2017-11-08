const tables = require('./weekday.json')

const parseTime = string => {
  const time = /(\d+):(\d+)/.exec(string)
  if (time){
    const hours = parseInt(time[1])*60*60*1000
    const minutes = parseInt(time[2])*60*1000
    const ms = hours+minutes
    return ms
  }
}

const compose = (...fna)=>value=>[value,...fna].reduce((a,b)=>b(a))

const filterCol = (table,colKeys) => key => {
  const idx = colKeys.findIndex(val => key===val)
  return table.map(station=>station[idx])
}

const filterRow = (table,rowKeys) => key => {
  //console.log(table,rowKeys)
  const idx = rowKeys.findIndex(val => val[key[0]]===key[1])
  return table[idx]
}

const toMS = date => (date.getHours()*60+date.getMinutes())*60*1000
const fromMS = ms => {
  const date = new Date(ms)
  return date.getUTCHours()+":"+("00"+date.getUTCMinutes()).substr(-2)
}

const fuzzySearch = array => query => {
  let arr = array
  let qa = query.split("")
  qa.forEach(letter => arr = arr.filter(x => x.match(new RegExp(letter)))) 
  return arr
}

const queryStation = query => {
  let names = tables[0].stations.map(x=>x.name)
  return matches = fuzzySearch(names)(query)
}
//tmp
const red = '\x1b[31m'
const blue = '\x1b[34m'
const reset = '\x1b[0m'
const direction = {N:red+'NORTHBOUND'+reset, S:blue+'SOUTHBOUND'+reset}

/*
const nextTrain = table => stationName => (now=new Date()) => {
  //TODO get rid of this ugly kudge
  table = Array.prototype.isPrototypeOf(table)?table:[table]
  let nowms = toMS(now)
  let station = filterRow(table.times,table.stations)(["name",stationName])
  const sortP = n => parseInt(n)?parseInt(n):0
  station = station.sort((a,b)=>sortP(a)-sortP(b))
  let index = station.findIndex(x => x>nowms)
  let next = station[index]
  return console.log(direction[table.name]+' from '+matches[0]+" in "+fromMS(next-nowms)+' @ '+fromMS(next))
}
*/
//nexttrain from trainsjs
const nextTrain = timetable => query => (now=new Date()) => {
  const timetables = Array.prototype.isPrototypeOf(timetable)?timetable:[timetable]
  let names = timetable[0].stations.map(x=>x.name)
  let matches = fuzzySearch(names)(query)
  if (matches.length == 1){
    timetables.forEach(table =>{
      let nowms = toMS(now)
      let station = filterRow(table.times,table.stations)(["name",matches[0]])
      const sortP = n => parseInt(n)?parseInt(n):0
      station = station.sort((a,b)=>sortP(a)-sortP(b))
      let index = station.findIndex(x => x>nowms)
      let next = station[index]
      let nextnext = station[index+1]?station[index+1]:station[0]
      return console.log(direction[table.name]+' from '+matches[0]+" in "+fromMS(next-nowms)+' @ '+fromMS(next))
    })
  } else if (matches.length >= 2) {
    console.log(red+'sorry, query aliasing happened :( \nquery: "'+query+'" actually matches '+ matches)
  } else {
    console.log(red+"sorry, query didn't match anything :( ")
  }
}

importGTFS = gtfsDir => {
let parseGTFS = gtfsBuff => {
let array = gtfsBuff.toString().split("\n").map(e => e.split(","))
let keys = array[0]
let rest = array.slice(1)
return {keys,rest}
}
let dir = fs.readdirSync(gtfsDir)
let parsedGTFS = dir.map(file => fs.readFileSync(`${gtfsDir}/${file}`)).map(f => parseGTFS(f))
let raw = {}
dir.forEach((file,i) => raw[file.match(/(.*)\./)[1]] = parsedGTFS[i])
return {raw}
}
trains = importGTFS("./GTFS")

module.exports = {
  compose : compose ,
  tables : tables ,
  filterCol : filterCol ,
  filterRow : filterRow ,
  fuzzySearch : fuzzySearch ,
  fromMS : fromMS ,
  toMS : toMS ,
  parseTime : parseTime ,
  queryStation : queryStation ,
  nextTrain : nextTrain ,
  nextTrain : nextTrain ,
  fuzzySearch : fuzzySearch 
}
