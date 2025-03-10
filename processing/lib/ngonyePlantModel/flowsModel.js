import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import eFlowsModelSetup from './eFlowsModel.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(parameters) {
  
  const eFlowsModel = eFlowsModelSetup(parameters)

  return (day)=>{
    const flows = {}
    flows.river = day.flow
    flows.eFlows = eFlowsModel(day.datetime.month, day.ewrFlowBand)

    if (flows.eFlows.total>flows.river) { throw new Error('eFlows exceed river flow') }
    flows.eFlowProportion = flows.eFlows.total / flows.river
    
    flows.availableGenerationFlow = flows.river - flows.eFlows.total
    flows.availableGenerationFlowProportion = flows.availableGenerationFlow / flows.river

    flows.canalFlow = d3.min([flows.availableGenerationFlow, parameters.unitsAvailable*parameters.maximumFlowUnit])
    if (flows.canalFlow < parameters.minimumFlowUnit) { 
      flows.canalFlow = 0
      if (!day.generation) {day.generation = {}}
      day.generation.shutoffLowFlow = true
    }

    flows.spill = {}
    flows.spill.total = flows.river - flows.eFlows.total - flows.canalFlow
    if (flows.spill.total<0) { throw new Error('Spill is negative') }

    flows.spill.channelA = flows.spill.total * (flows.eFlows.channelA / flows.eFlows.total)
    flows.spill.channelC = flows.spill.total * (flows.eFlows.channelC / flows.eFlows.total)
    flows.spill.channelD = flows.spill.total * (flows.eFlows.channelD / flows.eFlows.total)
    flows.spill.channelE = flows.spill.total * (flows.eFlows.channelE / flows.eFlows.total)
    flows.spill.channelFG = flows.spill.total * (flows.eFlows.channelFG / flows.eFlows.total)

    flows.channels = {}
    flows.channels.channelA = flows.eFlows.channelA + flows.spill.channelA
    flows.channels.channelC = flows.eFlows.channelC + flows.spill.channelC
    flows.channels.channelD = flows.eFlows.channelD + flows.spill.channelD
    flows.channels.channelE = flows.eFlows.channelE + flows.spill.channelE
    flows.channels.channelFG = flows.eFlows.channelFG + flows.spill.channelFG

    flows.channels.left = flows.channels.channelA + flows.channels.channelC + flows.channels.channelD + flows.canalFlow

    return flows
  }
  
}