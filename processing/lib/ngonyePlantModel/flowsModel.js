import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsModelSetup from './eFlowsModel.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(parameters) {
  
  const eFlowsModel = eFlowsModelSetup(parameters)


  const spillProportions = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.channelSpillProportions, 'utf-8'), d3.autoType)[0]
  const spillLimits = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.spillLimits, 'utf-8'), d3.autoType)[0]

  return (day)=>{
    const flows = {}
    flows.river = day.flow
    flows.eFlows = eFlowsModel(day.datetime.month, day.ewrFlowBand, day.flow)

    flows.eFlowProportion = toP(flows.eFlows.total / flows.river,3)
    
    flows.availableGenerationFlow = toP(flows.river - flows.eFlows.total,6)
    flows.availableGenerationFlowProportion = toP(flows.availableGenerationFlow / flows.river,3)

    flows.canal = d3.min([flows.availableGenerationFlow, parameters.unitsAvailable*parameters.maximumFlowUnit])
    if (flows.canal < parameters.minimumFlowUnit) { 
      flows.canal = 0
      if (!day.generation) {day.generation = {}}
      day.generation.shutoffLowFlow = true
    }

    flows.spill = {}
    flows.spill.total = toP(flows.river - flows.eFlows.total - flows.canal,6)
    if (flows.spill.total<-1) { 
      console.log(day,flows)
      throw new Error('Spill is negative') 
    }

    flows.spill.channelA = d3.min([spillLimits.channelA-flows.eFlows.channelA,flows.spill.total * spillProportions.A])
    flows.spill.channelC = d3.min([spillLimits.channelC-flows.eFlows.channelC,flows.spill.total * spillProportions.C])
    flows.spill.channelD = d3.min([spillLimits.channelD-flows.eFlows.channelD,flows.spill.total * spillProportions.D])
    flows.spill.channelE = d3.min([spillLimits.channelE,flows.spill.total * spillProportions.E])-flows.eFlows.channelE
    flows.spill.channelFG = flows.spill.total - (flows.spill.channelA + flows.spill.channelC + flows.spill.channelD + flows.spill.channelE)

    flows.channels = {}
    flows.channels.channelA = flows.eFlows.channelA + flows.spill.channelA
    flows.channels.channelC = flows.eFlows.channelC + flows.spill.channelC
    flows.channels.channelD = flows.eFlows.channelD + flows.spill.channelD
    flows.channels.channelE = flows.eFlows.channelE + flows.spill.channelE
    flows.channels.channelFG = flows.eFlows.channelFG + flows.spill.channelFG

    flows.channels.left = flows.channels.channelA + flows.channels.channelC + flows.channels.channelD + flows.canal
    return flows
  }
  
}

function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 