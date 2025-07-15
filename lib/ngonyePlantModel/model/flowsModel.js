import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import eFlowsModelSetup from './eFlowsModel.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../../') ) + '/data/ngonyePlantModels/'

// ************************************************
// Setup the flows model - called once per model run
export default function setup(params) {

  // Setup the eFlows model
  const eFlowsModel = eFlowsModelSetup(params)

  // Get the spill proportions and limits lookuk files
  const spillProportions = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.channelSpillProportions, 'utf-8'), d3.autoType)[0]
  const spillLimits = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.spillLimits, 'utf-8'), d3.autoType)[0]

  // ************************************************
  // Return the function that will calculate the flows for a given day
  return (day)=>{
    // Results object
    const flows = {}
    flows.river = day.flow
    
    //Use the eFlows model to get eflows in each channel
    flows.eFlows = eFlowsModel(day.datetime.month, day.ewrFlowBand, day.flow)
    flows.eFlowProportion = toP(flows.eFlows.total / flows.river,3)
    
    // Calculate the available generation flow
    flows.availableGenerationFlow = toP(flows.river - flows.eFlows.total,6)
    flows.availableGenerationFlowProportion = toP(flows.availableGenerationFlow / flows.river,3)

    // Calculate the canal flow - limited by the canal capacity
    flows.canal = d3.min([flows.availableGenerationFlow, params.unitsAvailable*params.maximumFlowUnit])

    // Check that there is enough flow to operate one unit
    if (flows.canal < params.minimumFlowUnit) { 
      flows.canal = 0
      if (!day.generation) {day.generation = {}}
      day.generation.shutoffLowFlow = true
    }

    // Calculate the spill flows
    flows.spill = {}
    flows.spill.total = Math.round(toP(flows.river - flows.eFlows.total - flows.canal,6),2)
    if (flows.spill.total<-1) { 
      //console.log(day,flows)
      throw new Error('Spill is negative') 
    }

    // Distribute the spill flows according to the spill proportions lookup
    flows.spill.channelA = Math.round(d3.min([spillLimits.channelA-flows.eFlows.channelA,flows.spill.total * spillProportions.A]),1)
    flows.spill.channelC = Math.round(d3.min([spillLimits.channelC-flows.eFlows.channelC,flows.spill.total * spillProportions.C]),1)
    flows.spill.channelD = Math.round(d3.min([spillLimits.channelD-flows.eFlows.channelD,flows.spill.total * spillProportions.D]),1)
    flows.spill.channelE = Math.round(d3.min([spillLimits.channelE,flows.spill.total * spillProportions.E])-flows.eFlows.channelE,1)
    flows.spill.channelFG = Math.round(flows.spill.total - (flows.spill.channelA + flows.spill.channelC + flows.spill.channelD + flows.spill.channelE),1)

    // Calculate the total flows in each channel
    flows.channels = {}
    flows.channels.channelA = flows.eFlows.channelA + flows.spill.channelA
    flows.channels.channelC = flows.eFlows.channelC + flows.spill.channelC
    flows.channels.channelD = flows.eFlows.channelD + flows.spill.channelD
    flows.channels.channelE = flows.eFlows.channelE + flows.spill.channelE
    flows.channels.channelFG = flows.eFlows.channelFG + flows.spill.channelFG

    // Calculate the left channel flows (upstream of the intake)
    flows.channels.left = flows.channels.channelA + flows.channels.channelC + flows.channels.channelD + flows.canal
    return flows
  }
}

function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 