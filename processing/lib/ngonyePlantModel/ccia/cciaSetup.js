import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsSetup from '../eFlowsSetup.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../../') ) + '/data/ngonyePlantModels/ccia/'

// *****************************************************
// Load the input hydrology file
const cciaHydrology_raw=d3.csvParse(fs.readFileSync(folder + 'Ngonye_CC_flows_combined.csv', 'utf-8'), d3.autoType)
const dates = cciaHydrology_raw.map(v=>DateTime.fromJSDate(v.Date))
const modelNames = cciaHydrology_raw.columns.slice(1)
const cciaModels = modelNames.map(modelName=>{
  return {
    modelName: modelName,
    daily: dates.map((date,i)=> {
      return {
        date: date.toISODate(),
        datetime: date,
        flow: cciaHydrology_raw[i][modelName]
      }
    })  
  }
})

cciaModels.forEach((cciaModel,i)=>{ 
  if (i==0) {
    cciaModel.daily = eFlowsSetup(cciaModel.daily)
    cciaModel.daily.forEach(d=>delete d.datetime)
    cciaModel.daily.forEach(d=>d.ewrMeasurementDate=d.ewrMeasurementDate.toISODate())
    fs.writeFileSync(folder + '/flowModels/' + cciaModel.modelName + '.csv', d3.csvFormat(cciaModel.daily))
  }
  
})

//console.log(dates)
//console.log(modelNames)
//console.log(cciaModels[0].daily)
