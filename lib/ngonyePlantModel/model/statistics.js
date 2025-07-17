import * as d3 from 'd3'

export default function statistics(parameters, dys, fast) {

  const daily = dys.map(d=>{
    return {
      date: d.datetime.toISODate(),
      waterYear: d.waterYear,
      waterMonth: d.waterMonth,
      waterWeek: d.waterWeek,
      day: d.day,
      flowRiver: toP(d.flow,5),
      flowRiverPercentile: toP(d.FDCPercentile,2),
      ewrFlowBandNumber: d.ewrFlowBandNumber,
      ewrFlowBand: d.ewrFlowBand,
      eFlowChannelA: toP(d.flows.eFlows.channelA,3),
      eFlowChannelC: toP(d.flows.eFlows.channelC,3),
      eFlowChannelD: toP(d.flows.eFlows.channelD,3),
      eFlowChannelE: toP(d.flows.eFlows.channelE,3),
      eFlowChannelFG: toP(d.flows.eFlows.channelFG,3),
      eFlowTotal: toP(d.flows.eFlows.total,3),
      eFlowProportion: toP(d.flows.eFlowProportion,2),
      availableGenerationFlow: toP(d.flows.availableGenerationFlow,4),
      availableGenerationFlowProportion: toP(d.flows.availableGenerationFlowProportion,2),
      canalFlow: toP(d.flows.canal,4),
      spillFlowTotal: toP(d.flows.spill.total,3),
      spillFlowChannelA: toP(d.flows.spill.channelA,3),
      spillFlowChannelC: toP(d.flows.spill.channelC,3),
      spillFlowChannelD: toP(d.flows.spill.channelD,3),
      spillFlowChannelE: toP(d.flows.spill.channelE,3),
      spillFlowChannelFG: toP(d.flows.spill.channelFG,3),
      channelFlowA: toP(d.flows.channels.channelA,3),
      channelFlowC: toP(d.flows.channels.channelC,3),
      channelFlowD: toP(d.flows.channels.channelD,3),
      channelFlowE: toP(d.flows.channels.channelE,3),
      channelFlowFG: toP(d.flows.channels.channelFG,3),
      leftChannelFlow: toP(d.flows.channels.left,3),
      headPondLevel: toP(d.levels.headpond,4),
      tailwaterLevel: toP(d.levels.tailwaterLevel,4),
      grossHead: toP(d.levels.grossHead,3),
      leftChannelHeadloss: toP(d.levels.headlosses.leftchannel,3),
      canalHeadloss: toP(d.levels.headlosses.canal,3),
      canalHeadlossProportion: toP(d.levels.headlosses.canalProportion,3),
      upstreamHeadloss: toP(d.levels.headlosses.upstream,3),
      upstreamHeadlossProportion: toP(d.levels.headlosses.upstreamProportion,3),
      units: d.generation.calc2.units,
      headlossTurbine: toP(d.generation.calc2.headlossTurbine,3),
      totalHeadloss: toP(d.generation.calc2.headlossTotal,3),
      headlossProportion: toP(d.generation.calc2.headlossProportion,3),
      netHead: toP(d.generation.calc2.netHead,3),
      unitEfficiency: toP(d.generation.calc2.unitEfficiency,3),
      generatorEfficiency: toP(d.generation.calc2.generatorEfficiency,3),
      totalEfficiency: toP(d.generation.calc2.totalEfficiency,3),
      unitPower: toP(d.generation.calc2.unitPower,3),
      generatorPower: toP(d.generation.calc2.generatorPower,3),
      plantPower: toP(d.generation.calc2.plantPower,3),
      energy: toP(d.generation.calc2.plantEnergy,3)
    }
  })

  const fdc = d3.rollups(dys, v => {
    return {
      exceedance: Number.parseFloat(v[0].FDCPercentile).toFixed(2),
      flowRiver: toP(d3.mean(v, d=>d.flow),5),
      flowRiverPercentile: toP(d3.mean(v, d=>d.FDCPercentile),2),
      eFlowChannelA: toP(d3.mean(v, d=>d.flows.eFlows.channelA),3),
      eFlowChannelC: toP(d3.mean(v, d=>d.flows.eFlows.channelC),3),
      eFlowChannelD: toP(d3.mean(v, d=>d.flows.eFlows.channelD),3),
      eFlowChannelE: toP(d3.mean(v, d=>d.flows.eFlows.channelE),3),
      eFlowChannelFG: toP(d3.mean(v, d=>d.flows.eFlows.channelFG),3),
      eFlowTotal: toP(d3.mean(v, d=>d.flows.eFlows.total),3),
      eFlowProportion: toP(d3.mean(v, d=>d.flows.eFlowProportion),2),
      availableGenerationFlow: toP(d3.mean(v, d=>d.flows.availableGenerationFlow),4),
      availableGenerationFlowProportion: toP(d3.mean(v, d=>d.flows.availableGenerationFlowProportion),2),
      canalFlow: toP(d3.mean(v, d=>d.flows.canal),4),
      spillFlowTotal: toP(d3.mean(v, d=>d.flows.spill.total),3),
      spillFlowChannelA: toP(d3.mean(v, d=>d.flows.spill.channelA),3),
      spillFlowChannelC: toP(d3.mean(v, d=>d.flows.spill.channelC),3),
      spillFlowChannelD: toP(d3.mean(v, d=>d.flows.spill.channelD),3),
      spillFlowChannelE: toP(d3.mean(v, d=>d.flows.spill.channelE),3),
      spillFlowChannelFG: toP(d3.mean(v, d=>d.flows.spill.channelFG),3),
      channelFlowA: toP(d3.mean(v, d=>d.flows.channels.channelA),3),
      channelFlowC: toP(d3.mean(v, d=>d.flows.channels.channelC),3),
      channelFlowD: toP(d3.mean(v, d=>d.flows.channels.channelD),3),
      channelFlowE: toP(d3.mean(v, d=>d.flows.channels.channelE),3),
      channelFlowFG: toP(d3.mean(v, d=>d.flows.channels.channelFG),3),
      leftChannelFlow: toP(d3.mean(v, d=>d.flows.channels.left),3),
      headPondLevel: toP(d3.mean(v, d=>d.levels.headpond),4),
      tailwaterLevel: toP(d3.mean(v, d=>d.levels.tailwaterLevel),4),
      grossHead: toP(d3.mean(v, d=>d.levels.grossHead),3),
      leftChannelHeadloss: toP(d3.mean(v, d=>d.levels.headlosses.leftchannel),3),
      canalHeadloss: toP(d3.mean(v, d=>d.levels.headlosses.canal),3),
      canalHeadlossProportion: toP(d3.mean(v, d=>d.levels.headlosses.canalProportion),3),
      upstreamHeadloss: toP(d3.mean(v, d=>d.levels.headlosses.upstream),3),
      upstreamHeadlossProportion: toP(d3.mean(v, d=>d.levels.headlosses.upstreamProportion),3),
      units: d3.mean(v, d=>d.generation.calc2.units),
      headlossTurbine: toP(d3.mean(v, d=>d.generation.calc2.headlossTurbine),3),
      totalHeadloss: toP(d3.mean(v, d=>d.generation.calc2.headlossTotal),3),
      headlossProportion: toP(d3.mean(v, d=>d.generation.calc2.headlossProportion),3),
      netHead: toP(d3.mean(v, d=>d.generation.calc2.netHead),3),
      unitEfficiency: toP(d3.mean(v, d=>d.generation.calc2.unitEfficiency),3),
      generatorEfficiency: toP(d3.mean(v, d=>d.generation.calc2.generatorEfficiency),3),
      totalEfficiency: toP(d3.mean(v, d=>d.generation.calc2.totalEfficiency),3),
      unitPower: toP(d3.mean(v, d=>d.generation.calc2.unitPower),3),
      generatorPower: toP(d3.mean(v, d=>d.generation.calc2.generatorPower),3),
      plantPower: toP(d3.mean(v, d=>d.generation.calc2.plantPower),3),
      plantEnergy: toP(d3.sum(v, d=>d.generation.calc2.plantEnergy),3) //MWh      
    }
  }, v=> Number.parseFloat(v.FDCPercentile).toFixed(2)).map(v=>v[1]).sort((a,b)=>d3.ascending(a.exceedance, b.exceedance))

  function aggregate(dys, fKey) {
    return d3.rollups(dys, v=>{

      let ret = {
        datetime: v[0].datetime,
        year: v[0].datetime.year,
        month: v[0].datetime.month,
        waterYear: v[0].waterYear,
        waterMonth: v[0].waterMonth,
        waterWeek: v[0].waterWeek,
        days: v.length,
        riverVolume: toP(d3.sum(v,d=>d.flow)*24*60*60/1000/1000/1000,3), //km3
        eFlowVolume: toP(d3.sum(v,d=>d.flows.eFlows.total)*24*60*60/1000/1000/1000,3), //km3
        canalVolume: toP(d3.sum(v,d=>d.flows.canal)*24*60*60/1000/1000/1000,3), //km3      
        energy: toP(d3.sum(v,d=>d.generation.calc2.plantEnergy),6),
        plantPowerMax: toP(d3.max(v,d=>d.generation.calc2.plantPower),4),
        plantPowerMin: toP(d3.max(v,d=>d.generation.calc2.plantPower),4),
        plantPowerMean: toP(d3.mean(v,d=>d.generation.calc2.plantPower),4),
        turbinesMax: d3.max(v,d=>d.generation.calc2.units),
        turbinesMin: d3.min(v,d=>d.generation.calc2.units),
        turbinesMean: d3.mean(v,d=>d.generation.calc2.units),
        flowMean: toP(d3.mean(v,d=>d.flow),4),
        flowMin: toP(d3.min(v,d=>d.flow),4),
        flowMax: toP(d3.max(v,d=>d.flow),4),
        flowAvailableForGenerationMean: toP(d3.mean(v,d=>d.flows.availableGenerationFlow),4),
        flowAvailableForGenerationMin: toP(d3.min(v,d=>d.flows.availableGenerationFlow),4),
        eFlowMean: toP(d3.mean(v,d=>d.flows.eFlows.total),4),
        eFlowMin: toP(d3.min(v,d=>d.flows.eFlows.total),4),
        eFlowMax: toP(d3.max(v,d=>d.flows.eFlows.total),4),
        spillFlowMean: toP(d3.mean(v,d=>d.flows.spill.total),4),
        spillFlowMin: toP(d3.min(v,d=>d.flows.spill.total),4),
        spillFlowMax: toP(d3.max(v,d=>d.flows.spill.total),4),
        eFlowProportionMean: toP(d3.mean(v,d=>d.flows.eFlowProportion),3),
        eFlowProportionMin: toP(d3.min(v,d=>d.flows.eFlowProportion),3),
        eFlowProportionMax: toP(d3.max(v,d=>d.flows.eFlowProportion),3),
        canalFlowMean: toP(d3.mean(v,d=>d.flows.canal),4),
        canalFlowMin: toP(d3.min(v,d=>d.flows.canal),4),
        canalFlowMax: toP(d3.max(v,d=>d.flows.canal),4),
        headPondLevelMean: toP(d3.mean(v,d=>d.levels.headpond),5),
        headPondLevelMin: toP(d3.min(v,d=>d.levels.headpond),5),
        headPondLevelMax: toP(d3.max(v,d=>d.levels.headpond),5),
        tailwaterLevelMean: toP(d3.mean(v,d=>d.levels.tailwaterLevel),4),
        tailwaterLevelMin: toP(d3.min(v,d=>d.levels.tailwaterLevel),4),
        tailwaterLevelMax: toP(d3.max(v,d=>d.levels.tailwaterLevel),4),
        grossHeadMean: toP(d3.mean(v,d=>d.levels.grossHead),3),
        grossHeadMin: toP(d3.min(v,d=>d.levels.grossHead),3),
        grossHeadMax: toP(d3.max(v,d=>d.levels.grossHead),3),
        leftChannelHeadlossMean: toP(d3.mean(v,d=>d.levels.headlosses.leftchannel),3),
        leftChannelHeadlossMin: toP(d3.min(v,d=>d.levels.headlosses.leftchannel),3),
        leftChannelHeadlossMax: toP(d3.max(v,d=>d.levels.headlosses.leftchannel),3),
        canalHeadlossMean: toP(d3.mean(v,d=>d.levels.headlosses.canal),3),
        canalHeadlossMin: toP(d3.min(v,d=>d.levels.headlosses.canal),3),
        canalHeadlossMax: toP(d3.max(v,d=>d.levels.headlosses.canal),3),
        canalHeadlossProportionMean: toP(d3.mean(v,d=>d.levels.headlosses.canalProportion),2),
        canalHeadlossProportionMin: toP(d3.min(v,d=>d.levels.headlosses.canalProportion),2),
        canalHeadlossProportionMax: toP(d3.max(v,d=>d.levels.headlosses.canalProportion),2),
        totalHeadlossMean: toP(d3.mean(v,d=>d.generation.calc2.headlossTotal),3),
        totalHeadlossMin: toP(d3.min(v,d=>d.generation.calc2.headlossTotal),3),
        totalHeadlossMax: toP(d3.max(v,d=>d.generation.calc2.headlossTotal),3),
        headlossProportionMean: toP(d3.mean(v,d=>d.generation.calc2.headlossProportion),2),
        headlossProportionMin: toP(d3.min(v,d=>d.generation.calc2.headlossProportion),2),
        headlossProportionMax: toP(d3.max(v,d=>d.generation.calc2.headlossProportion),2),
        netHeadMean: toP(d3.mean(v,d=>d.generation.calc2.netHead),4),
        netHeadMin: toP(d3.min(v,d=>d.generation.calc2.netHead),4),
        netHeadMax: toP(d3.max(v,d=>d.generation.calc2.netHead),4),
        unitEfficiencyMean: toP(d3.mean(v,d=>d.generation.calc2.unitEfficiency),3),
        unitEfficiencyMin: toP(d3.min(v,d=>d.generation.calc2.unitEfficiency),3),
        unitEfficiencyMax: toP(d3.max(v,d=>d.generation.calc2.unitEfficiency),3),
        generatorEfficiencyMean: toP(d3.mean(v,d=>d.generation.calc2.generatorEfficiency),3),
        generatorEfficiencyMin: toP(d3.min(v,d=>d.generation.calc2.generatorEfficiency),3),
        generatorEfficiencyMax: toP(d3.max(v,d=>d.generation.calc2.generatorEfficiency),3),
        totalEfficiencyMean: toP(d3.mean(v,d=>d.generation.calc2.totalEfficiency),3),
        totalEfficiencyMin: toP(d3.min(v,d=>d.generation.calc2.totalEfficiency),3),
        totalEfficiencyMax: toP(d3.max(v,d=>d.generation.calc2.totalEfficiency),3),
        unitPowerMean: toP(d3.mean(v,d=>d.generation.calc2.unitPower),4),
        unitPowerMin: toP(d3.min(v,d=>d.generation.calc2.unitPower),4),
        unitPowerMax: toP(d3.max(v,d=>d.generation.calc2.unitPower),4),
        generatorPowerMean: toP(d3.mean(v,d=>d.generation.calc2.generatorPower),4),
        generatorPowerMin: toP(d3.min(v,d=>d.generation.calc2.generatorPower),4),
        generatorPowerMax: toP(d3.max(v,d=>d.generation.calc2.generatorPower),4),
        lowFlowShutoffDays: v.filter(d=>d.generation.shutoffLowFlow).length,
        highHeadShutoffDays: v.filter(d=>d.generation.shutoffHighHead).length, 
        lowHeadShutoffDays: v.filter(d=>d.generation.shutoffLowHead).length,
        lowFlowShutoffProportion: toP(v.filter(d=>d.generation.shutoffLowFlow).length/v.length,3),
        highHeadShutoffProportion: toP(v.filter(d=>d.generation.shutoffHighHead).length/v.length,3),
        lowHeadShutoffProportion: toP(v.filter(d=>d.generation.shutoffLowHead).length/v.length,3),
        capFactor: toP(d3.sum(v,d=>d.generation.calc2.plantEnergy)/(parameters.plantCapacity*24*v.length),3)
      }
      ret.shutoffProportion = toP((ret.lowFlowShutoffDays + ret.highHeadShutoffDays + ret.lowHeadShutoffDays)/v.length,3)
      ret.bypassVolume = toP(ret.riverVolume - ret.canalVolume,4)
      ret.eFlowProportion = toP(ret.eFlowVolume/ret.riverVolume,2)
      ret.generationProportion = toP(ret.canalVolume/ret.riverVolume,2)
      ret.bypassProportion = toP(1-ret.generationProportion,2)
      ret.specificEnergy = toP(ret.energy/ret.riverVolume/1000,3) //Mwh per km3
      return ret
    },d=>fKey(d)).map(v=>v[1])
  }
  const monthly = aggregate(dys, d=>d.datetime.startOf('month'))
  monthly.forEach(d=>delete d.waterWeek)
  //console.log(monthly[1])

  const weekly = aggregate(dys, d=>d.datetime.startOf('week'))
  //console.log(weekly[1])

  const weeklySlim = weekly.map(d=>{
    return {
      date: d.datetime.toISODate(),
      waterYear: d.waterYear,
      waterMonth: d.waterMonth,
      waterWeek: d.waterWeek,
      flowMean: d.flowMean,
      eFlowMean: d.eFlowMean,
      eFlowProportionMean: d.eFlowProportionMean,
      canalFlowMean: d.canalFlowMean,
      headPondLevelMean: d.headPondLevelMean,
      tailwaterLevelMean: d.tailwaterLevelMean,
      grossHeadMean: d.grossHeadMean,
      totalHeadlossMean: d.totalHeadlossMean,
      netHeadMean: d.netHeadMean,
      unitEfficiencyMean: d.unitEfficiencyMean,
      generatorEfficiencyMean: d.generatorEfficiencyMean,
      totalEfficiencyMean: d.totalEfficiencyMean,
      unitPowerMean: d.unitPowerMean,
      generatorPowerMean: d.generatorPowerMean,
      plantPowerMean: d.plantPowerMean,
      energy: d.energy,
    }
})

  function aggregateYearly(dys, fKey) {
    return d3.rollups(dys, v=>{
      let ret = {
        waterYear: v[0].waterYear,
        year: v[0].datetime.year,
        days: v.length,
        energy: toP(d3.sum(v, d => d.generation.calc2.plantEnergy) / 1000, 4), // MWh
        powerMax: toP(d3.max(v, d => d.generation.calc2.plantPower), 4),
        powerMin: toP(d3.min(v, d => d.generation.calc2.plantPower), 4),
        powerMean: toP(d3.mean(v, d => d.generation.calc2.plantPower), 4),
        flowMean: toP(d3.mean(v, d => d.flow), 4),
        flowMin: toP(d3.min(v, d => d.flow), 4),
        flowMax: toP(d3.max(v, d => d.flow), 4),
        riverVolume: toP(d3.sum(v, d => d.flow) * 24 * 60 * 60 / 1000 / 1000 / 1000, 3), // km3
        eFlowVolume: toP(d3.sum(v, d => d.flows.eFlows.total) * 24 * 60 * 60 / 1000 / 1000 / 1000, 3), // km3
        canalVolume: toP(d3.sum(v, d => d.flows.canal) * 24 * 60 * 60 / 1000 / 1000 / 1000, 3), // km3
        eFlowProportionMean: toP(d3.mean(v, d => d.flows.eFlowProportion), 3),
        eFlowProportionMin: toP(d3.min(v, d => d.flows.eFlowProportion), 3),
        eFlowProportionMax: toP(d3.max(v, d => d.flows.eFlowProportion), 3),
        lowFlowShutoffDays: v.filter(d => d.generation.shutoffLowFlow).length,
        highHeadShutoffDays: v.filter(d => d.generation.shutoffHighHead).length,
        lowHeadShutoffDays: v.filter(d => d.generation.shutoffLowHead).length,
        lowFlowShutoffProportion: toP(v.filter(d => d.generation.shutoffLowFlow).length / 365, 2),
        highHeadShutoffProportion: toP(v.filter(d => d.generation.shutoffHighHead).length / 365, 2),
        lowHeadShutoffProportion: toP(v.filter(d => d.generation.shutoffLowHead).length / 365, 2),
        capFactor: toP(d3.sum(v, d => d.generation.calc2.plantEnergy) / (parameters.plantCapacity * 24 * 365), 3),
        proportion4Units: toP(v.filter(d => d.generation.calc2.units == 4).length / 365, 2),
        proportion3Units: toP(v.filter(d => d.generation.calc2.units == 3).length / 365, 2),
        proportion2Units: toP(v.filter(d => d.generation.calc2.units == 2).length / 365, 2),
        proportion1Units: toP(v.filter(d => d.generation.calc2.units == 1).length / 365, 2),
        proportion0Units: toP(v.filter(d => d.generation.calc2.units == 0).length / 365, 2)
      }
      ret.shutoffDays = ret.lowFlowShutoffDays + ret.highHeadShutoffDays + ret.lowHeadShutoffDays
      ret.shutoffDaysProportion = ret.shutoffDays / 365
      ret.bypassVolume = toP(ret.riverVolume - ret.canalVolume, 4)
      ret.eFlowProportion = toP(ret.eFlowVolume / ret.riverVolume, 2)
      ret.generationProportion = toP(ret.canalVolume / ret.riverVolume, 2)
      ret.bypassProportion = toP(1 - ret.generationProportion, 2)
      ret.specificEnergy = toP(ret.energy / ret.riverVolume, 3) // Mwh per km3
      return ret
    },d=>fKey(d)).map(v=>v[1])
  }

  const yearly = aggregateYearly(dys, d=>d.waterYear)
  yearly.forEach(v=>delete v.year)
  //console.log(yearly[1])

  const calendarYearly = aggregateYearly(dys, d=>d.datetime.year)
  calendarYearly.forEach(v=>delete v.waterYear)
  //console.log(calendarYearly[1])

  const annualExceedances = [...Array(101).keys()].map(v=> {
    return {
      exceedance: v/100,
      energy: toP(d3.quantile(yearly, 1-(v/100), d=>d.energy), 4),
      riverVolume: toP(d3.quantile(yearly, 1-(v/100), d=>d.riverVolume), 3),
      capFactor: toP(d3.quantile(yearly, 1-(v/100), d=>d.capFactor), 3),
      eFlowProportion: toP(d3.quantile(yearly, 1-(v/100), d=>d.eFlowProportion), 3),
      specificEnergy: toP(d3.quantile(yearly, 1-(v/100), d=>d.specificEnergy), 3),
      shutoffDaysProportion: toP(d3.quantile(yearly, 1-(v/100), d=>d.shutoffDaysProportion), 3)
    }
  })
  //console.log(annualExceedances)

  let dailyExceedances = []
  if (!fast) {
    dailyExceedances = [...Array(101).keys()].map(v=> {
      return {
        exceedance: v/100,
        power: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.plantPower),3),
        energy: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.plantEnergy),3),
        // riverFlow: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.river),3),
        // eFlow: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.eFlows.total),3),
        // eFlowProportion: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.eFlowProportion),3),
        // canalFlow: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.canal),3),
        // headPondLevel: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.headpond),3),
        // tailwaterLevel: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.tailwaterLevel),3),
        // grossHead: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.grossHead),3),
        // netHead: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.netHead),3),
        // totalEfficiency: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.totalEfficiency),3),
      }
    })
    //console.log(dailyExceedances)
  }

  const monthlyExceedances = [...Array(101).keys()].map(v=> {
    return {
      exceedance: v/100,
      flow: toP(d3.quantile(monthly, 1-(v/100), d=>d.flowMean),3),
      plantPower: toP(d3.quantile(monthly, 1-(v/100), d=>d.plantPowerMean),3),
      energy: toP(d3.quantile(monthly, 1-(v/100), d=>d.energy),3),

      grossHead: toP(d3.quantile(monthly, 1-(v/100), d=>d.grossHeadMean),3),
      canalFlow: toP(d3.quantile(monthly, 1-(v/100), d=>d.canalFlowMean),3),
      netHead: toP(d3.quantile(monthly, 1-(v/100), d=>d.netHeadMean),3),
      totalEfficiency: toP(d3.quantile(monthly, 1-(v/100), d=>d.totalEfficiencyMean),3),
      totalHeadloss: toP(d3.quantile(monthly, 1-(v/100), d=>d.totalHeadlossMean),3),

      eFlowProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.eFlowProportion),3),
      generationProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.generationProportion),3),
      bypassProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.bypassProportion),3),
      specificEnergy: toP(d3.quantile(monthly, 1-(v/100), d=>d.specificEnergy),3),
      shutoffProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.shutoffProportion),3),
    }
  })
  //console.log(monthlyExceedances)

  const calMonthly = d3.rollups(monthly, v=>{
    let ret = {
      month: v[0].month,
      waterMonth: v[0].waterMonth,
      flowMean: toP(d3.mean(v, d => d.flowMean), 4),
      flowMedian: toP(d3.median(v, d => d.flowMean), 4),
      flowMin: toP(d3.min(v, d => d.flowMean), 4),
      flowMax: toP(d3.max(v, d => d.flowMean), 4),
      canalFlowMean: toP(d3.mean(v, d => d.canalFlowMean), 4),
      canalFlowMedian: toP(d3.median(v, d => d.canalFlowMean), 4),
      canalFlowMin: toP(d3.min(v, d => d.canalFlowMean), 4),
      canalFlowMax: toP(d3.max(v, d => d.canalFlowMean), 4),
      eFlowMean: toP(d3.mean(v, d => d.eFlowMean), 4),
      eFlowMedian: toP(d3.median(v, d => d.eFlowMean), 4),
      eFlowMin: toP(d3.min(v, d => d.eFlowMean), 4),
      eFlowMax: toP(d3.max(v, d => d.eFlowMean), 4),   
      spillFlowMean: toP(d3.mean(v, d => d.spillFlowMean), 4),
      spillFlowMedian: toP(d3.median(v, d => d.spillFlowMean), 4),
      spillFlowMin: toP(d3.min(v, d => d.spillFlowMean), 4),
      spillFlowMax: toP(d3.max(v, d => d.spillFlowMean), 4),               
      grossHeadMean: toP(d3.mean(v, d => d.grossHeadMean), 4),
      grossHeadMedian: toP(d3.median(v, d => d.grossHeadMean), 4),
      grossHeadMin: toP(d3.min(v, d => d.grossHeadMean), 4),
      grossHeadMax: toP(d3.max(v, d => d.grossHeadMean), 4),
      netHeadMean: toP(d3.mean(v, d => d.netHeadMean), 4),
      netHeadMedian: toP(d3.median(v, d => d.netHeadMean), 4),
      netHeadMin: toP(d3.min(v, d => d.netHeadMean), 4),
      netHeadMax: toP(d3.max(v, d => d.netHeadMean), 4),
      energyMax: toP(d3.max(v, d => d.energy), 4),
      energyMin: toP(d3.min(v, d => d.energy), 4),
      energyMean: toP(d3.mean(v, d => d.energy), 4), // MWh
      energyMedian: toP(d3.median(v, d => d.energy), 4), // MWh
      plantPowerMax: toP(d3.max(v, d => d.plantPowerMean), 4),
      plantPowerMin: toP(d3.min(v, d => d.plantPowerMean), 4),
      plantPowerMean: toP(d3.mean(v, d => d.plantPowerMean), 4),
      plantPowerMedian: toP(d3.median(v, d => d.plantPowerMean), 4),
      eFlowProportionMean: toP(d3.mean(v, d => d.eFlowProportionMean), 2),
      generationProportionMean: toP(d3.mean(v, d => d.generationProportion), 2),
      bypassProportionMean: toP(d3.mean(v, d => d.bypassProportion), 2),
      lowFlowShutoffProportion: toP(d3.mean(v, d => d.lowFlowShutoffProportion), 2),
      highHeadShutoffProportion: toP(d3.mean(v, d => d.highHeadShutoffProportion), 2),
      lowHeadShutoffProportion: toP(d3.mean(v, d => d.lowHeadShutoffProportion), 2),
      capFactorMean: toP(d3.mean(v, d => d.capFactor), 2),
      specificEnergyMean: toP(d3.mean(v, d => d.specificEnergy), 3),
    }
    ret.dischargeMedian = ret.flowMedian * 60 * 60 * 24 * monthDays(v[0].month-1) / 1000000 //Mm3
    ret.eFlowDischargeMedian = ret.eFlowMedian * 60 * 60 * 24 * monthDays(v[0].month-1) / 1000000 //Mm3
    ret.spillDischargeMedian = ret.spillFlowMedian * 60 * 60 * 24 * monthDays(v[0].month-1) / 1000000 //Mm3
    ret.canalDischargeMedian = ret.canalFlowMedian * 60 * 60 * 24 * monthDays(v[0].month-1) / 1000000 //Mm3
    return ret
  },d=>d.month).map(v=>v[1])
  //console.log(calMonthly)

  const calMonthlyEnergyExceedances = [...Array(12).keys()].map(m=> {
    const ret = {
      month: m+1,
      waterMonth: (m>=9 ? m-9 : m+3)+1,
    }
    const exc=[...Array(101).keys()]
    exc.forEach(e=> {
      ret[d3.format('.2f')(1-(e/100),3)] = toP(d3.quantile(monthly.filter(d=>d.month==(m+1)), 1-(e/100), d=>d.energy),5)
    })    
    return ret
  }).sort((a,b)=>d3.ascending(a.waterMonth, b.waterMonth))
  //console.log(calMonthlyEnergyExceedances)

  if (dys[0].datetime.hour!==0) {
    throw new Error('Datetime not at midnight: ' + dys[0].datetime.toISO())
  }
  const waterYearBasis = dys[0].datetime.month==10

  const statistics = {
    yearType: waterYearBasis ? 'Water' : 'Calendar',
    energyAnnualMean: toP(d3.mean(waterYearBasis ? yearly : calendarYearly, d => d.energy), 3),
    energyAnnualP50: toP(d3.quantile(waterYearBasis ? yearly : calendarYearly, 0.5, d => d.energy), 3),
    p95Power: toP(d3.quantile(dys, 0.05, d => d.generation.calc2.plantPower), 3),
    capFactorMean: toP(d3.mean(waterYearBasis ? yearly : calendarYearly, d => d.capFactor), 3),
    lowFlowShutoffProportionMean: toP(d3.mean(waterYearBasis ? yearly : calendarYearly, d => d.lowFlowShutoffProportion), 3),
    highHeadShutoffProportionMean: toP(d3.mean(waterYearBasis ? yearly : calendarYearly, d => d.highHeadShutoffProportion), 3),
    lowHeadShutoffProportionMean: toP(d3.mean(waterYearBasis ? yearly : calendarYearly, d => d.lowHeadShutoffProportion), 3),
    shutoffDaysProportionMean: toP(d3.mean(waterYearBasis ? yearly : calendarYearly, d => d.shutoffDaysProportion), 3),
  }
  statistics.Skew = (statistics.energyAnnualP50 - statistics.energyAnnualMean)/statistics.energyAnnualMean
  
  return {fdc, daily,weekly, weeklySlim, monthly, yearly, calendarYearly, calMonthly, calMonthlyEnergyExceedances, dailyExceedances, monthlyExceedances, annualExceedances, statistics}
}
 
function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 

function monthDays(i) {
  if(i === 4 || i === 6 || i === 9 || i === 11) {
		return 30
	} else if(i === 2) {
		return 28
	} else {
		return 31
	}
}