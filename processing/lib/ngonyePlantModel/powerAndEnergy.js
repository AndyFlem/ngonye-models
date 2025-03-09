

import * as d3 from 'd3'
import fs from 'fs'

export function calculateUnitPower(parameters, unitFlow, netHead) {

  // Get the turbine unit efficiency
  const turbineEfficiency = 0.9

  // Get the generator efficiency
  const generatorEfficiency = 0.98

  // Calculate the unit power
  unitPower = unitFlow * netHead * 9.81 * 999.7 * turbineEfficiency / 1000000

  // Calculate the generator power
  generatorPower = unitPower * generatorEfficiency



}