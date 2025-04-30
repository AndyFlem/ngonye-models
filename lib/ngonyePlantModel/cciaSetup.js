import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsSetup from './model/eFlowsSetup.js'

const hydrologySet = '2024'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/'

// Load the full series hydrology
const fullSeries=d3.csvParse(fs.readFileSync(folder + 'syntheticFlowSeries/' + hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
  v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
  return v
})

// Load the CCIA hydrology series
const cciaHydrology_raw=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/ccia/Ngonye_CC_flows_combined.csv', 'utf-8'), d3.autoType)

// Rearrage
const dates = cciaHydrology_raw.map(v=>DateTime.fromJSDate(v.Date))
const modelNames = cciaHydrology_raw.columns.slice(1)

const cciaModels = modelNames.map(modelName=>{
  return {
    modelName: modelName,
    daily: dates.map((date,i)=> {
      let v = {
        date: date.toISODate(),
        datetime: date,        
        flow: cciaHydrology_raw[i][modelName]
      }
      v.day = v.datetime.ordinal
    
      if (v.datetime.month>=10) {
        v.waterYear = v.datetime.year
        v.waterMonth = v.datetime.month-9
        v.waterDay = v.datetime.ordinal - 273 - (v.datetime.isInLeapYear ? 1 : 0)
      } else {
        v.waterMonth = v.datetime.month+3
        v.waterDay = v.datetime.ordinal + (365-273)
        v.waterYear = v.datetime.year-1
      }
      v.waterWeek = Math.floor((v.waterDay-1)/7)+1
      return v      
    })  
  }
})

// Annotate with EWRs and save each of the CCIA hydrology series
const annotateEWRs = true
if (annotateEWRs) {
  cciaModels.forEach((cciaModel,i)=>{ 
    if (i>=0) {
      console.log('Processing... ' + cciaModel.modelName + ' with ' + hydrologySet + ' hydrology.')
      cciaModel.daily = eFlowsSetup(fullSeries, cciaModel.daily)
      cciaModel.daily.forEach(d=>delete d.datetime)
      cciaModel.daily.forEach(d=>d.ewrMeasurementDate=d.ewrMeasurementDate.toISODate())
      fs.writeFileSync(folder + 'ngonyePlantModels/ccia/flowModels/' + hydrologySet + '/' + cciaModel.modelName + '.csv', d3.csvFormat(cciaModel.daily))
    }
  })
}


modelNames.unshift('ModelName')
fs.writeFileSync(folder + 'ngonyePlantModels/ccia/flowModels/cciaModels_' + hydrologySet + '.csv', d3.csvFormatRows(modelNames.map(n=>[n])))

//console.log(dates)
//console.log(modelNames)
//console.log(cciaModels[0].daily)
