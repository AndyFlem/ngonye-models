import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { interpolate, interpolate2d } from '../../library.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../../') ) + '/data/ngonyePlantModels/'

// ************************************************
// Setup the levels and losses model - called once per model run
export default function setup(params) {
  
  // Load the lookup files
  const leftchannelHeadlosses = d3.csvParseRows(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.headlossLeftChannel, 'utf-8'), d3.autoType)
  const canalHeadlosses = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.headlossCanal, 'utf-8'), d3.autoType)
  const tailwaterLevels = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.tailwaterLevel, 'utf-8'), d3.autoType)
  const turbineHeadloss = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.headlossTurbine, 'utf-8'), d3.autoType)

  // ************************************************
  // Return two functions to be called for each day
  return {
    // ************************************************
    // Upstream (excluding the turbine) levels and headlosses
    upstream: (day)=>{
      // Create a results object
      const levels = {}
  
      //Headpond level    
      if (day.flow < 5000) {
        levels.headpond = 990.0 + params.headpondLift
      } else if (day.flow < 7500) {
        levels.headpond = 0.000081307 * day.flow + 989.6 + params.headpondLift
      } else {
        levels.headpond = 0.000240 * day.flow + 988.4 + params.headpondLift
      }

      //Tailrace level
      levels.tailwaterLevel = interpolate(tailwaterLevels, 'flow', 'level', day.flow)
  
      levels.grossHead = levels.headpond - levels.tailwaterLevel
      if (levels.grossHead < 0) { throw new Error('Negative gross head') }
  
      //Left channel head losses
      levels.headlosses = {}
      try {
        levels.headlosses.leftchannel = interpolate2d(leftchannelHeadlosses, levels.headpond - params.headpondLift, day.flows.channels.left)
      } catch (e) {
        throw new Error('Left channel headlosses error: ' + e.message)
      }
  
      //Canal head losses
      levels.headlosses.canal = interpolate(canalHeadlosses, 'FlowCanal', 'HeadlossCanal', day.flows.canal)
  
      levels.headlosses.upstream = levels.headlosses.leftchannel + levels.headlosses.canal
      levels.headlosses.upstreamProportion = levels.headlosses.upstream / levels.grossHead
      levels.headlosses.canalProportion = levels.headlosses.canal / levels.grossHead
      return levels
    },


    // ************************************************
    // Turbine flow and headlosses, results are added to the genCalc object - passed in
    unitHeadlosses: (day, genCalc)=>{
      // Calculate the unit flow
      // TODO: Optimise by putting maximum flow through n-1 units and remainder through last unit
      // currently all units get the same flow
      genCalc.unitFlow = day.flows.canal / genCalc.units
      
      // Get the turbine headloss
      if (genCalc.unitFlow>0) {
        genCalc.headlossTurbine = interpolate(turbineHeadloss, 'FlowUnit', 'HeadlossTurbine', genCalc.unitFlow)
      } else {
        genCalc.headlossTurbine = 0
      }

      // Calculate the net head and total headloss
      genCalc.netHead = day.levels.grossHead - day.levels.headlosses.leftchannel - day.levels.headlosses.canal - genCalc.headlossTurbine
      genCalc.headlossTotal = day.levels.headlosses.upstream + genCalc.headlossTurbine
      genCalc.headlossProportion = genCalc.headlossTotal / day.levels.grossHead
      
      // Check for low and high head shutoffs
      if (genCalc.netHead < params.minimumHead) {
        day.generation.shutoffLowHead = true
      }
      if (genCalc.netHead > params.maximumHead && params.maximumHeadShutdown) {
        // Only mark as high head shutoff if low flow shutoff is not already set to avoid double counting
        if (!day.generation.shutoffLowFlow == true) {
          day.generation.shutoffHighHead = true
        }
      }
    }
  }

  
}