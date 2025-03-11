import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/ngonyePlantModels/'

export default function setup(parameters) {
  
  // Load the eflows flow sets
  const eFlowsSets_raw = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.eFlowsAssuranceSets, 'utf-8'))
  const eFlowsSets = d3.groups(eFlowsSets_raw,v=>v.Set).map(v=>v[1][0])
  const eFlowSet = eFlowsSets.find(v=>v.Set==parameters.ewrCategorySet)
  if (!eFlowSet) { 
    throw new Error(`EWR category set not found: ${parameters.ewrCategorySet}`)
  }


  // Load the eFlows channel flows
  const channelFlowsSets_raw = d3.csvParse(fs.readFileSync(folder + 'lookups/' + parameters.lookupFileset.eFlowsChannelFlows, 'utf-8'), d3.autoType)
  const channelFlowsSets = d3.groups(channelFlowsSets_raw, v=>v.Section).map(v=>{
    return {
      Section: v[0],
      Months: v[1]
    }
  })

  const channelFlowSet = channelFlowsSets.map(s=>{
    const selectedCategory = eFlowSet[s.Section]

    return {
      Section: s.Section,
      Months: s.Months.filter(v=>v.Category==selectedCategory)
    }
  })

  return (month, flowCategory)=>{
      let ret = {}
      let total = 0
      channelFlowSet.forEach(s=>{
        const flow = s.Months.find(v=>v.Month==month)[flowCategory]
        if (!flow) { throw new Error('Flow Category not found') }
        
        ret['channel' + s.Section] = flow
        total += flow
      })
      ret.total = total
      return ret
    }
  
}