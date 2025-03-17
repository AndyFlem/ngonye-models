import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../../') ) + '/data/ngonyePlantModels/'

// ************************************************
// Setup the eFlows model - called once per model run
export default function setup(params) {
  
  // Load the eflows assurance level sets - eg: All C's or All B's
  const eFlowsSets_raw = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.eFlowsAssuranceSets, 'utf-8'))
  const eFlowsSets = d3.groups(eFlowsSets_raw,v=>v.Set).map(v=>v[1][0])
  const eFlowSet = eFlowsSets.find(v=>v.Set==params.ewrCategorySet)
  if (!eFlowSet) { 
    throw new Error(`EWR category set not found: ${params.ewrCategorySet}`)
  }

  // Load the eFlows channel flows that specify the flows required per channel
  // per assurance level and depending on the time of year.
  const channelFlowsSets_raw = d3.csvParse(fs.readFileSync(folder + 'lookups/' + params.lookupFileset.eFlowsChannelFlows, 'utf-8'), d3.autoType)
  const channelFlowsSets = d3.groups(channelFlowsSets_raw, v=>v.Section).map(v=>{
    return {
      Section: v[0],
      Months: v[1]
    }
  })

  // Build a lookup for eFlows based on the assurance level and month
  const channelFlowSet = channelFlowsSets.map(s=>{
    const selectedCategory = eFlowSet[s.Section]
    return {
      Section: s.Section,
      Months: s.Months.filter(v=>v.Category==selectedCategory)
    }
  })

  // ************************************************
  // Return the function that will calculate the eFlows for a given month, river flow category ('High', 'Medium', 'Low' etc)
  // and the previously selected assurance set
  // River flow used to check and scale the eFlows if the exceed total river flow
  return (month, flowCategory, riverFlow)=>{
      let ret = {}
      let total = 0
      // Get the eflows per channel
      channelFlowSet.forEach(s=>{
        const flow = s.Months.find(v=>v.Month==month)[flowCategory]
        if (!flow) { throw new Error('Flow Category not found') }
        
        ret['channel' + s.Section] = flow
        total += flow
      })
      ret.total = total

      // If there is not enough water for required eFlow then scale down
      if (ret.total>riverFlow) {
        const factor = riverFlow/ret.total
        Object.keys(ret).forEach(k=>{
          toP(ret[k] = ret[k]*factor,6)
        })
      }

      return ret
    }
  
}

function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 