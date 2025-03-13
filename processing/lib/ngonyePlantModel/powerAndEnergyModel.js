import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import { interpolate, interpolate2d } from '../library.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(params) {
  
  const hillchart = d3.csvParseRows(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.hillchart, 'utf-8'), d3.autoType)
  const generatorEfficiency = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.generatorEfficiency, 'utf-8'), d3.autoType)

  return (day, generation)=>{
    // Zero output if any shutoff condition
    if (!(day.generation.shutoffLowFlow || day.generation.shutoffHighHead || day.generation.shutoffLowHead)) {

      //Get the unit efficiency
      try {
        generation.unitEfficiency = interpolate2d(hillchart, generation.unitFlow, generation.netHead)
      } catch (e) {
        console.log(day)
        throw new Error('Unit efficiency error: ' + e.message)
      }

      //Calculate unit power
      generation.unitPower = generation.unitFlow * generation.netHead * 9.81 * 999.7 * generation.unitEfficiency / 1000000
      generation.unitPowerFactor =   generation.unitPower / params.ratedTurbineCapacity

      //Get the generator efficiency
      generation.generatorEfficiency = interpolate(generatorEfficiency, 'UnitPowerFactor', 'GeneratorEfficiency', generation.unitPowerFactor )
    
      generation.totalEfficiency = generation.unitEfficiency * generation.generatorEfficiency

      //Calculate generator power
      let tmpGeneratorPower = generation.unitPower * generation.generatorEfficiency

      //For the Sino/Andritz hillchart then if we are in the flood condition (high flow, low head) then reduce output by distance along the flood flow line
      // to take account of lower unit flows possible at lowest head conditions
      if (params.type=='sh') {
        if (isFloodFlow(generation.netHead, generation.unitFlow)) {
          generation.isFloodload = true
          tmpGeneratorPower = tmpGeneratorPower * floodFlowLine(generation.netHead) / params.maximumFlowUnit
        }
      }

      // Clip output to the maximum generator output
      if (params.constrainFinalGeneratorOutput) {
        tmpGeneratorPower = d3.min([tmpGeneratorPower, params.maxGeneratorOutput])
      }
      generation.generatorPower = tmpGeneratorPower

      generation.plantPower = generation.generatorPower * generation.units
      generation.plantEnergy = generation.plantPower * 24
    } else {
      generation.unitEfficiency = 0
      generation.unitPower = 0
      generation.unitPowerFactor = 0
      generation.generatorEfficiency = 0
      generation.generatorPower = 0
      generation.plantPower = 0
      generation.plantEnergy = 0
      generation.totalEfficiency = 0
    }
    return generation

  }
  function isFloodFlow(head, flow) {
    return flow > floodFlowLine(head, flow)
  }
  
  function floodFlowLine(head) {
    return (head * params.unitLimits.floodFlowCfs[0]) + params.unitLimits.floodFlowCfs[1]
  }
}