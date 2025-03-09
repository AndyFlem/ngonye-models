/****************************************************
Ngonye Falls - Setup Environmental Flow Requirements
****************************************************/

import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'
import { Console } from 'console'

export default function eFlowsSetup(parameters) {
  
  console.log('**** Setting up eFlows')

  const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') )
  const inputFolder = '/data/syntheticFlowSeries/' + parameters.hydrologySet + '/processed/'
  // Load the daily flow data

  const daily = d3.csvParse(fs.readFileSync(folder + inputFolder + 'daily.csv', 'utf-8'), d3.autoType).map(v=> {
    v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
    return v
  })


  // Build FDCs for each of the measurement dates
  const measurementDates = [[10, 1]]
  for (let month = 1; month <= 12; month++) {
    measurementDates.push([month, 8])
    measurementDates.push([month, 18])
    measurementDates.push([month, 28])
  }

  // Build FDCs for each of the 'measurement days' - 8th, 18th, 28th of each month
  const fdcs = measurementDates.map(m=> {
    return{
      month: m[0],
      day: m[1],
      exceedances: [...Array(101).keys()].map(e=> {
        return d3.quantile(daily.filter(d=>d.datetime.month == m[0] && d.datetime.day == m[1]), e/100, d=>d.flow) 
        
      })
    }

  })
  //console.log(fdcs)

  // Annotate each measurement date with the corresponding FDC exceedance
  daily.forEach(v=> {
    v.ewrMeasurementDate = measureDate(v.datetime)
    if (isMeasureDay(v.datetime) ) {
      const fdc = fdcs.find(f=>f.month == v.datetime.month && f.day == v.datetime.day)
      v.ewrMeasureExceedance = 1-(d3.bisectLeft(fdc.exceedances, v.flow)/100)
    }
  })
  
  // Annotate each day in the flow series with the corresponding EWR measurment date and the exceedance for that date
  daily.forEach(v=> {
    v.ewrMeasurementDate = measureDate(v.datetime)
    v.ewrExceedance = daily[d3.bisector((d) => d.datetime).left(daily, v.ewrMeasurementDate)].ewrMeasureExceedance
    v.ewrFlowBandNumber = flowBandNumber(v.ewrExceedance)
    v.ewrFlowBand = flowBand(v.ewrFlowBandNumber)
  })

  daily.forEach(d=>delete d.ewrMeasurementDate)
  daily.forEach(d=>delete d.ewrMeasureExceedance)
  daily.forEach(d=>delete d.datetime)

  fs.writeFileSync(folder + inputFolder + 'daily.csv', d3.csvFormat(daily))

}

// Gives the measure date (proceeding 8th, 18th or 28th) for the given date
function measureDate(obsDate) {
  if (obsDate.day <= 10 && obsDate.month === 10) {
    return DateTime.fromObject({ year: obsDate.year, month: 10, day: 1})
  }
  if (obsDate.day <= 10) {
    if (obsDate.month === 1) {
      return DateTime.fromObject({ year: obsDate.year - 1, month: 12, day: 28 })
    } else {
      return DateTime.fromObject({ year: obsDate.year, month: obsDate.month - 1, day: 28 })
    }
  } else if (obsDate.day <= 20) {
    return DateTime.fromObject({ year: obsDate.year, month: obsDate.month, day: 8 })
  } else {
    return DateTime.fromObject({ year: obsDate.year, month: obsDate.month, day: 18 })
  }
}

// If it is a measure date (8th, 18th or 28th) then returns the ID of an FDC for that date. Otherwise False.
function isMeasureDay(obsDate) {
  if ((obsDate.day === 8 || obsDate.day === 18 || obsDate.day === 28) || (obsDate.month === 10 && obsDate.day === 1)) {
    return true
  } else {
    return false
  }
}

function flowBandNumber(exceed) {
  if (exceed < 0.099) {
    return 1
  } else if (exceed < 0.399) {
    return 2
  } else if (exceed < 0.699) {
    return 3
  } else if (exceed < 0.899) {
    return 4
  } else {
    return 5
  }
}

function flowBand(bandNo) {
  if (bandNo == 1) {
    return 'Wet'
  } else if (bandNo == 2) {
    return 'Mod_Wet'
  } else if (bandNo == 3) {
    return 'Normal'
  } else if (bandNo == 4) {
    return 'Mod_Dry'
  } else {
    return 'Dry'
  }
}