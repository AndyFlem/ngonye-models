/****************************************************
Ngonye Falls Synthetic Historic Flow Series
****************************************************/

import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'
import { movingAverage } from '../library.js'

/* Parameters */
const cutoffWaterYear = 2016 //2024
const inputFolder = '/data/gaugeData/'
const outputFolder = '/data/syntheticFlowSeries/' + cutoffWaterYear + '/'
const vicFallsInputFileName = 'daily_gauge_vicfalls.csv'
const SiomaInputFileName = 'daily_gauge_ngonye.csv'

const cutoffDate = DateTime.fromObject({year: cutoffWaterYear+1, month: 10, day: 1})

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') )

// Delete all files in the output folder
console.log(folder + outputFolder)
fs.readdirSync(folder + outputFolder).forEach(file => {
  fs.unlink(folder + outputFolder + file, (err) => {
    if (err) {
      console.error(err)
    }
  })
})

console.log('*** Processing Ngonye Falls Synthetic Historic Flow Series')
console.log('** Load input files')
/* Load the Vic Falls Data */
const vicFallsDailyAll = d3.csvParse(fs.readFileSync(folder + inputFolder + vicFallsInputFileName, 'utf-8'), d3.autoType).map(v=> {
  v.datetime = DateTime.fromJSDate(v.date)
  return v
})
const vicFallsDaily=vicFallsDailyAll.filter(v=>v.datetime<=cutoffDate)

/*
Load the Sioma Gauge level data and calculate flow based on the stage-discharge relationship:
    flow=1093.0355*(level-2.85)^{1.659}
*/
const siomaDailyAll = d3.csvParse(fs.readFileSync(folder + inputFolder + SiomaInputFileName, 'utf-8'), d3.autoType).map(v=> {
  v.datetime = DateTime.fromJSDate(v.date)
  v.flow=1093.0355*(v.level-2.85)**1.659
  return v
})
const siomaDaily = siomaDailyAll.filter(v=>v.datetime<=cutoffDate)

/*
Build a Flow Duration Curve table in 0.1% exceedance increments.
*/
console.log('** Build FDC table')
const fdcs = [...Array(1001).keys()].map(v=> {
  return {
    exceedance: v/1000,
  }
})


/*
Add FDC flows for the full Vic Falls gauge.
Add FDC flows for the Sioma gauge.
Add FDC flows for the portion of the Vic Falls gauge that overlaps with the Sioma gauge.
*/
console.log('** Add FDC flows')
fdcs.forEach(v=> {
  v.vicFallsFull = d3.quantile(vicFallsDaily, v.exceedance, d=>d.flow)
  v.sioma = d3.quantile(siomaDaily, v.exceedance, d=>d.flow)
  v.vicFallsOverlap = d3.quantile(vicFallsDaily.filter(v=>v.date>=siomaDaily[0].date), v.exceedance, d=>d.flow)
})

//console.log(fdcs[0], fdcs[Math.floor(fdcs.length/2)-1],fdcs[Math.floor(fdcs.length/2)],fdcs[Math.floor(fdcs.length/2)+1],fdcs[fdcs.length-1])


/*
Calculate the ratio of Vic Falls flows : Vic Falls overlapping flows - across the FDC.
*/
console.log('** Calculate ratios')
fdcs.forEach(v=> {
  v.vicFallsRatio = v.vicFallsFull/v.vicFallsOverlap
})

/*
Smooth the Vic Falls ratio (0.7% moving average) except at the tails of the FDC.
*/
console.log('** Smooth')
const smoothedRatios = movingAverage(fdcs.map(v=>v.vicFallsRatio), 7)
fdcs.forEach((v,i)=> {
  if (i>=10 && i<fdcs.length-10) {
    v.vicFallsRatioSmoothed = smoothedRatios[i]
  } else {
    v.vicFallsRatioSmoothed = v.vicFallsRatio
  }
})
//console.log(fdcs[0], fdcs[Math.floor(fdcs.length/2)-1],fdcs[Math.floor(fdcs.length/2)],fdcs[Math.floor(fdcs.length/2)+1],fdcs[fdcs.length-1])

/*
Produce a scaled FDC for Ngonye by using the factors calculated for the Vic Falls data.
*/
console.log('** Scale FDC')
fdcs.forEach(v=> {
  v.ngonyeScaled = v.sioma * v.vicFallsRatioSmoothed
})
//console.log(fdcs[0], fdcs[Math.floor(fdcs.length/2)-1],fdcs[Math.floor(fdcs.length/2)],fdcs[Math.floor(fdcs.length/2)+1],fdcs[fdcs.length-1])

/*
Calculate a conversion factor as the ratio between the scaled Ngonye flows and the full Vic Falls series flows.
*/
console.log('** Conversion factor')
fdcs.forEach(v=> {
  v.conversionFactor = v.ngonyeScaled / v.vicFallsFull
})
//console.log(fdcs[0], fdcs[Math.floor(fdcs.length/2)-1],fdcs[Math.floor(fdcs.length/2)],fdcs[Math.floor(fdcs.length/2)+1],fdcs[fdcs.length-1])

/*
Give each record in the full Vic Falls series its corresponding conversion factor by lookup from the FDC. 
*/
console.log('** Lookup')
vicFallsDaily.forEach(v=> {
  let indx = d3.bisectRight(fdcs.map(v=>v.vicFallsFull), v.flow)-1
  
  v.conversionFactor = fdcs[indx].conversionFactor
  v.exceedance = fdcs[indx].exceedance
})
//console.log(vicFallsDaily[0])

/*
Prepare the full synthetic series for Ngonye by applying the 11 day lag to the Vic Falls 
series and the conversion factors calculated previoulsy.
*/
console.log('** Prepare synthectic')
const ngonyeSynthetic = vicFallsDaily.map((v,i)=> {
  if (i>=vicFallsDaily.length-11) { 
    return {
      date: v.date, 
      flow: vicFallsDaily[i].flow * vicFallsDaily[i].conversionFactor
    }
  }
  return {
    date: v.date,
    flow: vicFallsDaily[i+11].flow * vicFallsDaily[i+11].conversionFactor
  }
})

console.log(ngonyeSynthetic[ngonyeSynthetic.length-1])


 fs.writeFileSync(folder + outputFolder + `ngonyeFDCs.csv`, d3.csvFormat(fdcs))
 fs.writeFileSync(folder + outputFolder + `ngonyeFlowDaily.csv`, d3.csvFormat(ngonyeSynthetic))
fs.writeFileSync(folder + outputFolder + `vicFallsDaily_${cutoffWaterYear}.csv`, d3.csvFormat(vicFallsDaily))
fs.writeFileSync(folder + outputFolder + `sioma_${cutoffWaterYear}.csv`, d3.csvFormat(siomaDaily))