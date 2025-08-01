/****************************************************
Ngonye Falls Flow Statistics
****************************************************/
import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'
import processDailyFlow from './flowStatisticsLibrary.js'

/* Parameters */
const cutoffWaterYear = 2024
const inputFolder = '/data/syntheticFlowSeries/' + cutoffWaterYear + '/'
const outputFolder = '/data/syntheticFlowSeries/' + cutoffWaterYear + '/processed/'
const inputFileName = `ngonyeFlowDaily.csv`

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') )


// Delete all files in the output folder
// fs.readdirSync(folder + outputFolder).forEach(file => {
//   fs.unlink(folder + outputFolder + file, (err) => {
//     if (err) {
//       console.error(err)
//     }
//   })
// })

/* Load the daily data */
const daily = d3.csvParse(fs.readFileSync(folder + inputFolder + inputFileName, 'utf-8'), d3.autoType).map(v=> {
  v.datetime = DateTime.fromJSDate(v.date)
  return v
})

const statistics = processDailyFlow(daily)

fs.writeFileSync(folder + outputFolder + `daily.csv`, d3.csvFormat(statistics.daily))
fs.writeFileSync(folder + outputFolder + `weekly.csv`, d3.csvFormat(statistics.weekly))
fs.writeFileSync(folder + outputFolder + `monthly.csv`, d3.csvFormat(statistics.monthly))
fs.writeFileSync(folder + outputFolder + `yearly.csv`, d3.csvFormat(statistics.yearly))
fs.writeFileSync(folder + outputFolder + `calMonthly.csv`, d3.csvFormat(statistics.calMonthly))
fs.writeFileSync(folder + outputFolder + `calWeekly.csv`, d3.csvFormat(statistics.calWeekly))

fs.writeFileSync(folder + outputFolder + `fdc.csv`, d3.csvFormat(statistics.FDC))

fs.writeFileSync(folder + outputFolder + `calMonthlyFlowExceedance.csv`, d3.csvFormat(statistics.calMonthlyFlowExceedance))

fs.writeFileSync(folder + outputFolder + `calWeeklyFlowExceedance.csv`, d3.csvFormat(statistics.calWeeklyFlowExceedance))

fs.writeFileSync(folder + outputFolder + `annualExceedance.csv`, d3.csvFormat(statistics.annualExceedance))

fs.writeFileSync(folder + outputFolder + `flowStatistics.csv`, d3.csvFormat(statistics.flowStatistics))