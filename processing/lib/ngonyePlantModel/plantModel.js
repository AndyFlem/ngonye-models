import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsSetup from './eFlowsSetup.js'
import flowsModelSetup from './flowsModel.js'
import levelsAndLossesModelSetup from './levelsAndLossesModel.js'
import powerAndEnergyModelSetup from './powerAndEnergyModel.js'
import calcPEStatistics from './statistics.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/'

const modelRef = 'base_fs'
const recalculateEFlows = false 

// *****************************************************
// ** Load model params based on the modelRef
import { baseParams, models, lookupFilesets }  from '../../data/ngonyePlantModels/modelParameters.js'

const modelParams = models.find(v=>v.modelRef==modelRef)
if (!modelParams) { throw new Error(`Model not found with ref '${modelRef}'`) }
const params = {...baseParams,...modelParams}
params.lookupFileset = lookupFilesets.find(v=>v.ref == params.lookupsFileset)
console.log(params)

// *****************************************************
// Check if the modelStatistics output file exists
let modelsReport
if (fs.existsSync(folder + 'ngonyePlantModels/models/modelStatistics.csv')) {
  modelsReport=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/models/modelStatistics.csv', 'utf-8'), d3.autoType)    
} else {
  modelsReport = []
}

// ********************
// Load daily flow data
let daily = loadDaily(folder, params)
daily.map((v,i)=>v.index=i)

// *******************************************************************************
// Recalculate the eFlows exceedance values for the daily flow series (if needed)
if (!daily[0].ewrExceedance || recalculateEFlows) {
  eFlowsSetup(params)
  loadDaily(folder, params)
}

// ****************************************
// ** Setup the models
// Setup the flows model
const flowsModel = flowsModelSetup(params)

// Setup the levels and losses model
const levelsAndLossesModel = levelsAndLossesModelSetup(params)

//Setup the power and energy model
const powerAndEnergyModel = powerAndEnergyModelSetup(params)


// *******************
// ** Calculate by day
daily.forEach(dy=>{
  // *******************************
  // ** Calculate common conditions
  
  // Get the eFlows for each channel, calculate any spill flows, flow available for generation and the canal flow
  dy.flows = flowsModel(dy)
  // Get the headpond and tailwater levels and the headlosses in the canal and the left channel
  dy.levels = levelsAndLossesModel.upstream(dy)

  // ********************************************
  // ** Calculate power without generator limits
  if (!dy.generation) { dy.generation = {} }

  dy.generation.calc1 = {}
  dy.generation.calc1.units = Math.ceil(dy.flows.canal / params.maximumFlowUnit)

  levelsAndLossesModel.unitHeadlosses(dy, dy.generation.calc1)

  powerAndEnergyModel(dy, dy.generation.calc1)

  // *********************************************************
  // ** If necassary, recalculate power with generator limits
  let reCalc = false
  // If this is the FS style model 
  // and the generators are above their rated capacity then increase the number of units in use (if possible)
  if (params.type == 'fs' && dy.generation.calc1.generatorPower>params.maxGeneratorOutput && dy.generation.calc1.units < params.unitsAvailable) {
    dy.generation.generatorConstrained = true
    dy.generation.calc2 = {}
    dy.generation.calc2.units = dy.generation.calc1.units + 1
    
    reCalc = true 
  }

  // For the Sino/Andritz hillchart then increase number of turbines in use (if possible)
  // if in the first calculation the units were beyond the overload line (high flow, high head)
  if (params.type == 'sh') { 
    dy.generation.calc2 = {}

    if (dy.generation.calc1.units < params.unitsAvailable && isOverload(dy.generation.calc1.netHead, dy.generation.calc1.unitFlow)) {
      dy.generation.calc1.isOverload = true
      dy.generation.calc2.units = dy.generation.calc1.units + 1
    } else {
      dy.generation.calc2.units = dy.generation.calc1.units
    }
    reCalc = true
  }
  
  if (reCalc) {
    levelsAndLossesModel.unitHeadlosses(dy, dy.generation.calc2)
    powerAndEnergyModel(dy, dy.generation.calc2)
  } else {
    dy.generation.calc2 = dy.generation.calc1
  }
})

//console.log(daily.find(v=>v.datetime.toISODate() == '1975-04-01'))

// ***********************
// ** Calculate statistics
let stats = calcPEStatistics(params, daily)

// **********************
// ** Save the results
const modelsReportIndx = modelsReport.findIndex(v=>v.modelRef==modelRef)
const report = {...params,...stats.statistics}
delete report.lookupFileset
delete report.unitLimits
if (modelsReportIndx==-1) {
  modelsReport.push((report))
} else {
  modelsReport[modelsReportIndx]=report
}

console.log(stats.statistics)
fs.writeFileSync(folder + 'ngonyePlantModels/models/modelStatistics.csv', d3.csvFormat(modelsReport))
fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_daily.csv', d3.csvFormat(stats.daily))
fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_yearly.csv', d3.csvFormat(stats.yearly))

// *****************
// ** Lib functions
function loadDaily(folder, params) {
  return d3.csvParse(fs.readFileSync(folder + '/syntheticFlowSeries/' + params.hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
    v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
    return v
  })  
}

function isOverload(head, flow) {
  return flow > (head * params.unitLimits.overloadCfs[0]) + params.unitLimits.overloadCfs[1]
}
