import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'
import { interpolate, interpolate2d } from '../library.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(params) {
  
  const leftchannelHeadlosses = d3.csvParseRows(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.headlossLeftChannel, 'utf-8'), d3.autoType)
  const canalHeadlosses = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.headlossCanal, 'utf-8'), d3.autoType)
  const tailwaterLevels = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.tailwaterLevel, 'utf-8'), d3.autoType)
  const turbineHeadloss = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.headlossTurbine, 'utf-8'), d3.autoType)

  
  return {
    upstream: (day)=>{
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
    unitHeadlosses: (day, genCalc)=>{
      
      genCalc.unitFlow = day.flows.canal / genCalc.units
      if (genCalc.unitFlow>0) {
        genCalc.headlossTurbine = interpolate(turbineHeadloss, 'FlowUnit', 'HeadlossTurbine', genCalc.unitFlow)
      } else {
        genCalc.headlossTurbine = 0
      }
      genCalc.netHead = day.levels.grossHead - day.levels.headlosses.leftchannel - day.levels.headlosses.canal - genCalc.headlossTurbine
      genCalc.headlossTotal = day.levels.headlosses.upstream + genCalc.headlossTurbine
      genCalc.headlossProportion = genCalc.headlossTotal / day.levels.grossHead
      
      if (genCalc.netHead < params.minimumHead) {
        day.generation.shutoffLowHead = true
      }

      if (genCalc.netHead > params.maximumHead && params.maximumHeadShutdown) {
        day.generation.shutoffHighHead = true
      }


    }
  }

  
}