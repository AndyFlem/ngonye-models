import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsSetup from './eFlowsSetup.js'
import flowsModelSetup from './flowsModel.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') )

const modelRef = 'base'
const hydrologySet = '2016'
const recalculateEFlows = false

// Load the parameters
import { models, lookupFilesets }  from '../../data/ngonyePlantModels/modelParameters.js'

const parameters = models.find(v=>v.modelRef==modelRef)
parameters.hydrologySet = hydrologySet
parameters.lookupFileset = lookupFilesets.find(v=>v.ref == parameters.lookupsFileset)
console.log(parameters)

// Load daily flow data
let daily = loadDaily(folder, parameters)

// Calculate the eFlows exceedance values for the daily flow series (if needed)
if (!daily[0].ewrExceedance || recalculateEFlows) {
  eFlowsSetup(parameters)
  loadDaily(folder, parameters)
}

// Setup the flows model

const flowsModel = flowsModelSetup(parameters)

daily.forEach(dy=>{
  dy.flows = flowsModel(dy)
})
console.log(daily[0].flows)



function loadDaily(folder, parameters) {
  return d3.csvParse(fs.readFileSync(folder + '/data/syntheticFlowSeries/' + parameters.hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
    v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
    return v
  })  
}