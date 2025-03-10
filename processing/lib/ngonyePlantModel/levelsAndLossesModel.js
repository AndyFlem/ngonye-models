import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'
import { interpolate, interpolate2d } from '../library.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(parameters) {
  
  const leftchannelHeadlosses = d3.csvParseRows(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.headlossLeftChannel, 'utf-8'), d3.autoType)
  const canalHeadlosses = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.headlossCanal, 'utf-8'), d3.autoType)
  const tailwaterLevels = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.tailwaterLevel, 'utf-8'), d3.autoType)
  const turbineHeadloss = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.headlossTurbine, 'utf-8'), d3.autoType)

  
  return {
    upstream: (day)=>{
      const levels = {}
  
      //Headpond level    
      if (day.flow < 5000) {
        levels.headpond = 990.0 + parameters.headpondLift
      } else if (day.flow < 7500) {
        levels.headpond = 0.000081307 * day.flow + 989.6 + parameters.headpondLift
      } else {
        levels.headpond = 0.000240 * day.flow + 988.4 + parameters.headpondLift
      }
  
  
      //Tailrace level
      levels.tailwaterLevel = interpolate(tailwaterLevels, 'flow', 'level', day.flow)
  
      levels.grossHead = levels.headpond - levels.tailwaterLevel
      if (levels.grossHead < 0) { throw new Error('Negative gross head') }
      if (levels.grossHead > parameters.maximumHead && parameters.maximumHeadShutdown) {
        if (!day.generation) {day.generation = {}}
        day.generation.shutoffHighHead = true
        if (day.flows && day.flows.canal>0) { 
          const tmp = day.flows.canal
          day.flows.canal = 0
          day.flows.spill.total += tmp
          day.flows.spill.channelA += tmp
          day.flows.channels.channelA += tmp
          day.flows.channels.left += tmp
        }
      }
  
      //Left channel head losses
      levels.headlosses = {}
      try {
        levels.headlosses.leftchannel = interpolate2d(leftchannelHeadlosses, levels.headpond, day.flows.channels.left)
      } catch (e) {
        throw new Error('Left channel headlosses error: ' + e.message)
      }
  
      //Canal head losses
      levels.headlosses.canal = interpolate(canalHeadlosses, 'FlowCanal', 'HeadlossCanal', day.flows.canal)
  
      return levels
    },
    unitHeadlosses: (day, generation)=>{
      
      generation.unitFlow = day.flows.canal / generation.units
      if (generation.unitFlow>0) {
        generation.headlossTurbine = interpolate(turbineHeadloss, 'FlowUnit', 'HeadlossTurbine', generation.unitFlow)
      } else {
        generation.headlossTurbine = 0
      }
      generation.netHead = day.levels.grossHead - day.levels.headlosses.leftchannel - day.levels.headlosses.canal - generation.headlossTurbine  
    }
  }

  
}