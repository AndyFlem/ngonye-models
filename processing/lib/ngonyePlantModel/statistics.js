import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

export default function statistics(parameters, dys) {

  const daily = dys.map(d=>{
    return {
      date: d.datetime.toISODate(),
      waterYear: d.waterYear,
      waterMonth: d.waterMonth,
      energy: d.generation.calc2.plantEnergy
    }
  })

  const monthly = d3.rollups(dys, v=>{        
    return {
      datetime: v[0].datetime,
      year: v[0].datetime.year,
      month: v[0].datetime.month,
      waterMonth: v[0].waterMonth,
      energy: d3.sum(v,d=>d.generation.calc2.plantEnergy)
    }
  },d=>d.datetime.startOf('month').toISODate()).map(v=>v[1])

  const yearly = d3.rollups(dys, v=>{
    return {
      year: v[0].waterYear,
      energy: d3.sum(v,d=>d.generation.calc2.plantEnergy)
    }
  },d=>d.waterYear).map(v=>v[1])

  const statistics = {
    energyAnnualMean: d3.mean(yearly, d=>d.energy),
    energyAnnualP50: d3.quantile(yearly, 0.5, d=>d.energy),
    
  }

  return {daily,monthly,yearly, statistics}
}