#!/usr/bin/env node
const CT = require('./lib.js')
const tables = require('./weekday.json')

const red = '\x1b[31m'
const blue = '\x1b[34m'
const reset = '\x1b[0m'

const direction = {N:red+'NORTHBOUND'+reset, S:blue+'SOUTHBOUND'+reset}


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
    CT.nextTrain(tables)(station[0])(now)
  }
}
debugger;

handleArgs(process.argv)
