import * as d3 from 'd3'
import fs from 'fs'
import { interpolate } from '../library.js'

const monthDays=[31,28,31,30,31,30,31,31,30,31,30,31]

export default function processDailyFlow(daily, outputFolder) {

  // Daily FDC
  const FDC = [...Array(101).keys()].map(v=> {
    const ret = {
      exceedance: v/100,
      flow: d3.quantile(daily, 1-(v/100), d=>d.flow)
    }
    return ret
  })

  // Calendar month daily FDCs
  const calMonthlyFDCs = [...Array(101).keys()].map(v=> {
    const ret = {
      exceedance: v/100
    }
    const mns=[...Array(12).keys()]
    mns.forEach(m=> {
      ret[m+1] = d3.quantile(daily.filter(d=>d.datetime.month==(m+1)), 1-ret.exceedance, d=>d.flow)
    })    
    return ret
  }) 
  
  // Add FDC percentiles, Water Day, Week and Year to daily data
  daily.forEach((v,i)=> {
    v.FDCPercentile = interpolate(FDC, 'flow','exceedance', v.flow)
    v.calMonthlyFDCPercentile = interpolate(calMonthlyFDCs, v.datetime.month, 'exceedance', v.flow)
    // Add the day of the year to the daliy
    v.day = v.datetime.ordinal
    
    if (v.datetime.month>=10) {
      v.waterYear = v.datetime.year
      v.waterMonth = v.datetime.month-9
      v.waterDay = v.datetime.ordinal - 273 - (v.datetime.isInLeapYear ? 1 : 0)
    } else {
      v.waterMonth = v.datetime.month+3
      v.waterDay = v.datetime.ordinal + (365-273)
      v.waterYear = v.datetime.year-1
    }
    v.waterWeek = Math.floor((v.waterDay-1)/7)+1
    if (i>0) {
      v.flowChange = daily[i-1].flow - v.flow
      v.flowChangePercent = v.flowChange / daily[i-1].flow
    }
  })

  // Weekly aggregates
  const weekly = d3.rollups(daily, d => {
    let ret =  {
      date: d[0].datetime,
      datetime: d[0].datetime.toISO(),
      days: d.length,
      waterYear: d[0].waterYear,
      waterWeek: d[0].waterWeek,
      flowMean: Math.round(d3.mean(d, v=>v.flow)),
      flowMin: Math.round(d3.min(d, v=>v.flow)),
      flowMax: Math.round(d3.max(d, v=>v.flow)),
      flowMedian: Math.round(d3.median(d, v=>v.flow)),
      flowChange: Math.round(d[d.length-1].flow - d[0].flow),
      flowChangePercent: (d[d.length-1].flow - d[0].flow) / d[d.length-1].flow,
      volume: Math.round(d3.sum(d, v=>v.flow*24*60*60/1000000)), //Mm3
    }
    return ret
  }, d => (d.waterYear+d.waterWeek/100)).map(v=>v[1])

  // if (weekly[weekly.length-1].days<7 && weekly[weekly.length-1].0) {

  // }

  // Monthly aggregates
  const monthly = d3.rollups(daily, d => {
    let ret =  {
      year: d[0].datetime.year,
      month: d[0].datetime.month,
      waterMonth: d[0].waterMonth,
      waterYear: d[0].waterYear,
      flowMean: Math.round(d3.mean(d, v=>v.flow)),
      flowMin: Math.round(d3.min(d, v=>v.flow)),
      flowMax: Math.round(d3.max(d, v=>v.flow)),
      flowMedian: Math.round(d3.median(d, v=>v.flow)),
      flowChange: Math.round(d[d.length-1].flow - d[0].flow),
      flowChangePercent: (d[d.length-1].flow - d[0].flow) / d[d.length-1].flow,
      volume: Math.round(d3.sum(d, v=>v.flow*24*60*60/1000000)), //Mm3
    }
    return ret
  }, d => d.datetime.startOf('month')).map(v=>v[1])

  // Yearly aggregates
  const yearly = d3.rollups(daily, d => {
    let ret =  {
      waterYear: d[0].waterYear,
      flowMean: Math.round(d3.mean(d, v=>v.flow)),
      flowMin: Math.round(d3.min(d, v=>v.flow)),
      flowMax: Math.round(d3.max(d, v=>v.flow)),
      flowMedian: Math.round(d3.median(d, v=>v.flow)),
      volume: Math.round(d3.sum(d, v=>v.flow*24*60*60/1000000*365)), //Mm3
    }
    const wks = weekly.filter(v=>v.waterYear==ret.waterYear)
    ret.peakWeek = wks.toSorted((a,b)=>a.flowMean - b.flowMean)[wks.length-1].waterWeek
    let peaks = 0
    let peakWeeks = []
    wks.forEach((w,i) => {
      if (
        i>0 && 
        i<wks.length-1 && 
        w.flowMean > ret.flowMean && 
        wks[i-1].flowMean < wks[i].flowMean && 
        wks[i+1].flowMean < wks[i].flowMean) 
      {
        peaks+=1
        peakWeeks.push(w)
      }
    })
    ret.peaks=peaks
    ret.peakWeeks=peakWeeks.map(w=>w.waterWeek).join(',')
    return ret
  }, d => d.waterYear).map(v=>v[1])
  
  // Overall statistics
  const flowStatistics = [{
    fromDate: daily[0].datetime.toISO(),
    toDate: daily[daily.length-1].datetime.toISO(),
    flowMean: Math.round(d3.mean(daily, v=>v.flow)),
    flowAnnualMax: Math.round(d3.max(yearly, v=>v.flowMean)),
    flowAnnualMin: Math.round(d3.min(yearly, v=>v.flowMean))
  }]

  // Annual exceedance statistics
  const annualExceedance = [...Array(101).keys()].map(v=> {
    const ret = {
      exceedance: v/100,
      flowMean: d3.quantile(yearly, 1-(v/100), d=>d.flowMean), 
      flowMax: d3.quantile(yearly, 1-(v/100), d=>d.flowMax), 
      flowMin: d3.quantile(yearly, 1-(v/100), d=>d.flowMin),
      volume: d3.quantile(yearly, 1-(v/100), d=>d.volume),
    }
    return ret
  })

  // Calendar months aggregates
  const calMonthly = d3.rollups(monthly, d => {
    let ret =  {
      month: d[0].month,
      waterMonth: d[0].waterMonth,
      flowMean: Math.round(d3.mean(d, v=>v.flowMean)),
      flowMeanMax: Math.round(d3.mean(d, v=>v.flowMax)),
      flowMeanMin: Math.round(d3.mean(d, v=>v.flowMin)),
      volumeMean: Math.round(d3.mean(d, v=>v.volume)),
      flowChangeMean: Math.round(d3.mean(d, v=>v.flowChange)),
      flowChangePercentMean: d3.mean(d, v=>v.flowChangePercent),
    }

    ret.flowMin = d3.min(daily.filter(v=>v.datetime.month == d[0].month), v=>v.flow)
    ret.flowMax = d3.max(daily.filter(v=>v.datetime.month == d[0].month), v=>v.flow)
    ret.dailyFlowChangeMean = Math.round(d3.mean(daily.filter(v=>v.datetime.month == d[0].month), v=>v.flowChange))
    ret.dailyFlowChangePercentMean = d3.mean(daily.filter(v=>v.datetime.month == d[0].month), v=>v.flowChangePercent)

    return ret
  }, d => d.month).map(v=>v[1])

  // Calendar weeks aggregates
  const calWeekly = d3.rollups(weekly, d => {
    let ret =  {
      waterWeek: d[0].waterWeek,
      flowMean: Math.round(d3.mean(d, v=>v.flowMean)),
      volumeMean: Math.round(d3.mean(d, v=>v.volume)),
      flowChangeMean: Math.round(d3.mean(d, v=>v.flowChange)),
      flowChangePercentMean: d3.mean(d, v=>v.flowChangePercent),
    }

    return ret
  }, d => d.waterWeek).map(v=>v[1])

  // Calendar week daily FDCs
  const calWeeklyFlowExceedance = [...Array(101).keys()].map(v=> {
    const ret = {
      exceedance: v/100
    }
    const wks=[...Array(52).keys()]
    wks.forEach(m=> {
      ret[m+1] = d3.quantile(weekly.filter(d=>d.waterWeek==(m+1)), 1-ret.exceedance, d=>d.flowMean) 
    })    
    return ret
  })

  // Calendar month daily FDCs
  const calMonthlyFlowExceedance = [...Array(101).keys()].map(v=> {
    const ret = {
      exceedance: v/100
    }
    const mns=[...Array(12).keys()]
    mns.forEach(m=> {
      ret[m+1] = d3.quantile(monthly.filter(d=>d.waterMonth==(m+1)), 1-ret.exceedance, d=>d.flowMean) 
    })    
    return ret
  })

  // Add exceedance and variance to weekly, monthly and yearly aggregates
  weekly.forEach(v=> {
    v.flowMeanVariance = (v.flowMean - calWeekly[v.waterWeek-1].flowMean)/calWeekly[v.waterWeek-1].flowMean
    v.flowMeanCalWeeklyExceedance = interpolate(calWeeklyFlowExceedance, v.waterWeek, 'exceedance', v.flowMean)
  })
  monthly.forEach(v=> {
    v.flowMeanVariance = (v.flowMean - calMonthly[v.month-1].flowMean)/calMonthly[v.month-1].flowMean
    v.flowMeanCalMonthExceedance = interpolate(calMonthlyFlowExceedance, v.waterMonth, 'exceedance', v.flowMean)
  })
  yearly.forEach(v=>{
    v.flowMeanVariance = (v.flowMean - flowStatistics[0].flowMean)/flowStatistics[0].flowMean
    v.flowMinVariance = (v.flowMin - flowStatistics[0].flowMin)/flowStatistics[0].flowMin
    v.flowMeanExceedance = interpolate(annualExceedance, 'flowMean', 'exceedance', v.flowMean)
    v.flowMaxExceedance = interpolate(annualExceedance, 'flowMax', 'exceedance', v.flowMax)
    v.flowMinExceedance = interpolate(annualExceedance, 'flowMin', 'exceedance', v.flowMin)
  })
  
  // Delete the datetime property from the daily data
  daily.forEach(d=>delete d.datetime)

  return {
    daily,
    weekly,
    monthly,
    yearly,
    calMonthly,
    calWeekly,
    FDC,
    calMonthlyFlowExceedance,
    calWeeklyFlowExceedance,
    annualExceedance,
    flowStatistics
  }
  
}

