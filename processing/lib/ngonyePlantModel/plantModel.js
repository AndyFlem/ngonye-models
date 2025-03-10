import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { domainToASCII, fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsSetup from './eFlowsSetup.js'
import flowsModelSetup from './flowsModel.js'
import levelsAndLossesModelSetup from './levelsAndLossesModel.js'
import powerAndEnergyModelSetup from './powerAndEnergyModel.js'
import statistics from './statistics.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/'

const modelRef = 'base'
const hydrologySet = '2016'
const recalculateEFlows = false

// Load the parameters
import { models, lookupFilesets }  from '../../data/ngonyePlantModels/modelParameters.js'

const parameters = models.find(v=>v.modelRef==modelRef)
parameters.hydrologySet = hydrologySet
parameters.lookupFileset = lookupFilesets.find(v=>v.ref == parameters.lookupsFileset)
//console.log(parameters)


// Load daily flow data
let daily = loadDaily(folder, parameters)
daily.map((v,i)=>v.index=i)

// Calculate the eFlows exceedance values for the daily flow series (if needed)
if (!daily[0].ewrExceedance || recalculateEFlows) {
  eFlowsSetup(parameters)
  loadDaily(folder, parameters)
}

// Setup the flows model
const flowsModel = flowsModelSetup(parameters)

// Setup the levels and losses model
const levelsAndLossesModel = levelsAndLossesModelSetup(parameters)

//Setup the power and energy model
const powerAndEnergyModel = powerAndEnergyModelSetup(parameters)

daily.forEach(dy=>{
  // Get the eFlows for each channel, calculate any spill flows, flow available for generation and the canal flow
  dy.flows = flowsModel(dy)
  // Get the headpond and tailwater levels and the headlosses in the canal and the left channel
  dy.levels = levelsAndLossesModel.upstream(dy)

  if (!dy.generation) { dy.generation = {} }  

  // Calculate the generation without generator constraints
  dy.generation.unconstrained = {}
  dy.generation.unconstrained.units = Math.ceil(dy.flows.canal / parameters.maximumFlowUnit)
  
  levelsAndLossesModel.unitHeadlosses(dy, dy.generation.unconstrained)
  
  powerAndEnergyModel(dy, dy.generation.unconstrained)

  // If the generators are above their rated capacity then increase the number of units in use (if possible)
  if (dy.generation.unconstrained.generatorPower>parameters.maxGeneratorOutput && dy.generation.unconstrained.units < parameters.unitsAvailable) {

    dy.generation.generatorConstrained = true
    dy.generation.constrained = {}
    dy.generation.constrained.units = dy.generation.unconstrained.units + 1
    
    levelsAndLossesModel.unitHeadlosses(dy, dy.generation.constrained)
    
    powerAndEnergyModel(dy, dy.generation.constrained)
  } else {
    dy.generation.constrained = dy.generation.unconstrained
  }

})
console.log(daily[daily.length-1])


let stats = statistics(parameters, daily)

fs.writeFileSync(folder + 'ngonyePlantModels/models/' + parameters.modelRef + '/pe_daily.csv', d3.csvFormat(stats.daily))



function loadDaily(folder, parameters) {
  return d3.csvParse(fs.readFileSync(folder + '/syntheticFlowSeries/' + parameters.hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
    v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
    return v
  })  
}