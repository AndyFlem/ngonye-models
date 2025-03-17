import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { interpolate, interpolate2d } from '../../library.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../../') ) + '/data/ngonyePlantModels/'

// ************************************************
// Setup the p&e model - called once per model run
export default function setup(params) {
  
  // Load the lookup files
  const hillchart = d3.csvParseRows(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.hillchart, 'utf-8'), d3.autoType)
  const generatorEfficiency = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.generatorEfficiency, 'utf-8'), d3.autoType)

  // ************************************************
  // Return the function that will calculate the power and energy for a given day
  // results are added to the genCalc object - passed in
  return (day, genCalc)=>{
    // Zero output if any shutoff condition
    if (!(day.generation.shutoffLowFlow || day.generation.shutoffHighHead || day.generation.shutoffLowHead)) {

      //Get the unit efficiency
      try {
        genCalc.unitEfficiency = interpolate2d(hillchart, genCalc.unitFlow, genCalc.netHead)
      } catch (e) {
        // console.log(day)
        throw new Error('Unit efficiency interp error: ' + e.message)
      }

      //Calculate unit power
      genCalc.unitPower = genCalc.unitFlow * genCalc.netHead * 9.81 * 999.7 * genCalc.unitEfficiency / 1000000
      genCalc.unitPowerFactor =   genCalc.unitPower / params.ratedTurbineCapacity

      //Get the generator efficiency
      genCalc.generatorEfficiency = interpolate(generatorEfficiency, 'UnitPowerFactor', 'GeneratorEfficiency', genCalc.unitPowerFactor )
      genCalc.totalEfficiency = genCalc.unitEfficiency * genCalc.generatorEfficiency

      //Calculate generator power
      let tmpGeneratorPower = genCalc.unitPower * genCalc.generatorEfficiency

      //For the Sino/Andritz hillchart then if we are in the flood condition (high flow, low head) then reduce output 
      // proportional to distance along the flood flow line
      // to take account of lower unit flows possible at lowest head conditions
      if (params.type=='sh') {
        if (isFloodFlow(genCalc.netHead, genCalc.unitFlow)) {
          genCalc.isFloodload = true
          tmpGeneratorPower = tmpGeneratorPower * floodFlowLine(genCalc.netHead) / params.maximumFlowUnit
        }
      }

      // Clip output to the maximum generator output
      if (params.constrainFinalGeneratorOutput) {
        tmpGeneratorPower = d3.min([tmpGeneratorPower, params.maxGeneratorOutput])
      }
      genCalc.generatorPower = tmpGeneratorPower

      // Calculate plant power and energy
      genCalc.plantPower = genCalc.generatorPower * genCalc.units
      genCalc.plantEnergy = genCalc.plantPower * 24
    } else {
      // Zero output if any shutoff condition
      genCalc.unitEfficiency = 0
      genCalc.unitPower = 0
      genCalc.unitPowerFactor = 0
      genCalc.generatorEfficiency = 0
      genCalc.generatorPower = 0
      genCalc.plantPower = 0
      genCalc.plantEnergy = 0
      genCalc.totalEfficiency = 0
    }
    return genCalc

  }
  function isFloodFlow(head, flow) {
    return flow > floodFlowLine(head, flow)
  }
  
  function floodFlowLine(head) {
    return (head * params.unitLimits.floodFlowCfs[0]) + params.unitLimits.floodFlowCfs[1]
  }
}