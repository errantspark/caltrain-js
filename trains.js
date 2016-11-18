#!/usr/bin/env node
const CT = require('./lib.js')

const red = '\x1b[31m'
const blue = '\x1b[34m'
const reset = '\x1b[0m'

const direction = {N:red+'NORTHBOUND'+reset, S:blue+'SOUTHBOUND'+reset}

const nextTrain = timetable => query => (now=new Date()) => {
  const timetables = Array.prototype.isPrototypeOf(timetable)?timetable:[timetable]
  let names = timetable[0].stations.map(x=>x.name)
  let matches = CT.fuzzySearch(names)(query)
  if (matches.length == 1){
    timetables.forEach(table =>{
      let nowms = CT.toMS(now)
      let station = CT.filterRow(table.times,table.stations)(["name",matches[0]])
      const sortP = n => parseInt(n)?parseInt(n):0
      station = station.sort((a,b)=>sortP(a)-sortP(b))
      let index = station.findIndex(x => x>nowms)
      let next = station[index]
      let nextnext = station[index+1]?station[index+1]:station[0]
      return console.log(direction[table.name]+' from '+matches[0]+" in "+CT.fromMS(next-nowms)+' @ '+CT.fromMS(next))
    })
  } else if (matches.length >= 2) {
    console.log(red+'sorry, query aliasing happened :( \nquery: "'+query+'" actually matches '+ matches)
  } else {
    console.log(red+"sorry, query didn't match anything :( ")
  }
}

const handleArgs = args => {
  let now = new Date()
  args = args.slice(2)
  let flags
  if (args.length == 0){
    console.log(red+"gimme some arguments fam")
  } else {
    flags = args[0]&&args[0][0]=='-'?args[0].slice(1).split(''):null
    flags?args.splice(0,1):null
  }
  let timeInArgs = args.map(CT.parseTime)
  const timeIndex = timeInArgs.findIndex(x=>x)
  timeInArgs = timeInArgs.join('')
  if (timeInArgs) {
    let time = parseInt(timeInArgs)
    args.splice(timeIndex,1)
    now = new Date(new Date().getTimezoneOffset()*60000+time)
  }
  if (args.length == 1){
    let station = CT.queryStation(args[0])
    CT.nextTrain(1)(station[0])(now)
  }
}

handleArgs(process.argv)
