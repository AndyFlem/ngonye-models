import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import { interpolate, interpolate2d } from '../library.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(parameters) {
  const hillchart = d3.csvParseRows(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.hillchart, 'utf-8'), d3.autoType)
  const generatorEfficiency = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.generatorEfficiency, 'utf-8'), d3.autoType)

  return (day, generation)=>{
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
      generation.unitPowerFactor =   generation.unitPower / parameters.ratedTurbineCapacity

      //Get the generator efficiency
      generation.generatorEfficiency = interpolate(generatorEfficiency, 'UnitPowerFactor', 'GeneratorEfficiency', generation.unitPowerFactor )
    
      if (parameters.constrainFinalGeneratorOutput) {
        generation.generatorPower = d3.min([generation.unitPower * generation.generatorEfficiency,parameters.maxGeneratorOutput])
      } else {
        generation.generatorPower = generation.unitPower * generation.generatorEfficiency
      }
      
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
    }
    return generation
    
  }
  
}
