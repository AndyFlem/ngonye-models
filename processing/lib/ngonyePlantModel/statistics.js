import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

export default function statistics(parameters, dys) {

  const daily = dys.map(d=>{
    return {
      date: d.datetime.toISODate(),
      waterMonth: d.datetime.month,
      energy: d.generation.constrained.plantEnergy
    }
  })

  const monthly = d3.rollups(dys, v=>{        
    return {
      datetime: v[0].datetime,
      year: v[0].datetime.year,
      month: v[0].datetime.month,
      waterMonth: v[0].waterMonth,
      energy: d3.sum(v,d=>d.generation.constrained.plantEnergy)
    }
  },d=>d.datetime.startOf('month').toISODate()).map(v=>v[1])

  const yearly = d3.rollups(dys, v=>{
    return {
      datetime: v[0].datetime,
      year: v[0].datetime.year,
      energy: d3.sum(v,d=>d.generation.constrained.plantEnergy)
    }
  },d=>d.datetime.startOf('year').toISODate()).map(v=>v[1])


  return {daily,monthly,yearly}
}