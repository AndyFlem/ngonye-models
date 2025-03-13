import * as d3 from 'd3'

export default function statistics(parameters, dys) {

  const daily = dys.map(d=>{
    return {
      date: d.datetime.toISODate(),
      waterYear: d.waterYear,
      waterMonth: d.waterMonth,
      energy: d.generation.calc2.plantEnergy
    }
  })

  function aggregate(dys, fKey) {
    return d3.rollups(dys, v=>{

      let ret = {
        datetime: v[0].datetime,
        Year: v[0].datetime.year,
        Month: v[0].datetime.month,
        WaterYear: v[0].waterYear,
        WaterMonth: v[0].waterMonth,
        WaterWeek: v[0].waterWeek,
        Days: v.length,
        RiverVolume: toP(d3.sum(v,d=>d.flow)*24*60*60/1000/1000/1000,3), //km3
        EFlowVolume: toP(d3.sum(v,d=>d.flows.eFlows.total)*24*60*60/1000/1000/1000,3), //km3
        CanalVolume: toP(d3.sum(v,d=>d.flows.canal)*24*60*60/1000/1000/1000,3), //km3      
        Energy: toP(d3.sum(v,d=>d.generation.calc2.plantEnergy),6),
        Power_max: toP(d3.max(v,d=>d.generation.calc2.plantPower),4),
        Power_min: toP(d3.max(v,d=>d.generation.calc2.plantPower),4),
        Power_mean: toP(d3.mean(v,d=>d.generation.calc2.plantPower),4),
        Turbines_max: d3.max(v,d=>d.generation.calc2.units),
        Turbines_min: d3.min(v,d=>d.generation.calc2.units),
        Turbines_mean: d3.mean(v,d=>d.generation.calc2.units),
        Flow_mean: toP(d3.mean(v,d=>d.flow),4),
        Flow_min: toP(d3.min(v,d=>d.flow),4),
        Flow_max: toP(d3.max(v,d=>d.flow),4),
        FlowAvailableForGeneration_mean: toP(d3.mean(v,d=>d.flows.availableGenerationFlow),4),
        FlowAvailableForGeneration_min: toP(d3.min(v,d=>d.flows.availableGenerationFlow),4),
        EFlow_mean: toP(d3.mean(v,d=>d.flows.eFlows.total),4),
        EFlow_min: toP(d3.min(v,d=>d.flows.eFlows.total),4),
        EFlow_max: toP(d3.max(v,d=>d.flows.eFlows.total),4),
        SpillFlow_mean: toP(d3.mean(v,d=>d.flows.spill.total),4),
        SpillFlow_min: toP(d3.min(v,d=>d.flows.spill.total),4),
        SpillFlow_max: toP(d3.max(v,d=>d.flows.spill.total),4),
        EFlowProportion_mean: toP(d3.mean(v,d=>d.flows.eFlowProportion),3),
        EFlowProportion_min: toP(d3.min(v,d=>d.flows.eFlowProportion),3),
        EFlowProportion_max: toP(d3.max(v,d=>d.flows.eFlowProportion),3),
        CanalFlow_mean: toP(d3.mean(v,d=>d.flows.canal),4),
        CanalFlow_min: toP(d3.min(v,d=>d.flows.canal),4),
        CanalFlow_max: toP(d3.max(v,d=>d.flows.canal),4),
        HeadPondLevel_mean: toP(d3.mean(v,d=>d.levels.headpond),5),
        HeadPondLevel_min: toP(d3.min(v,d=>d.levels.headpond),5),
        HeadPondLevel_max: toP(d3.max(v,d=>d.levels.headpond),5),
        TailwaterLevel_mean: toP(d3.mean(v,d=>d.levels.tailwaterLevel),4),
        TailwaterLevel_min: toP(d3.min(v,d=>d.levels.tailwaterLevel),4),
        TailwaterLevel_max: toP(d3.max(v,d=>d.levels.tailwaterLevel),4),
        GrossHead_mean: toP(d3.mean(v,d=>d.levels.grossHead),3),
        GrossHead_min: toP(d3.min(v,d=>d.levels.grossHead),3),
        GrossHead_max: toP(d3.max(v,d=>d.levels.grossHead),3),
        LeftChannelHeadloss_mean: toP(d3.mean(v,d=>d.levels.headlosses.leftchannel),3),
        LeftChannelHeadloss_min: toP(d3.min(v,d=>d.levels.headlosses.leftchannel),3),
        LeftChannelHeadloss_max: toP(d3.max(v,d=>d.levels.headlosses.leftchannel),3),
        CanalHeadloss_mean: toP(d3.mean(v,d=>d.levels.headlosses.canal),3),
        CanalHeadloss_min: toP(d3.min(v,d=>d.levels.headlosses.canal),3),
        CanalHeadloss_max: toP(d3.max(v,d=>d.levels.headlosses.canal),3),
        CanalHeadlossProportion_mean: toP(d3.mean(v,d=>d.levels.headlosses.canalProportion),2),
        CanalHeadlossProportion_min: toP(d3.min(v,d=>d.levels.headlosses.canalProportion),2),
        CanalHeadlossProportion_max: toP(d3.max(v,d=>d.levels.headlosses.canalProportion),2),
        TotalHeadloss_mean: toP(d3.mean(v,d=>d.generation.calc2.headlossTotal),3),
        TotalHeadloss_min: toP(d3.min(v,d=>d.generation.calc2.headlossTotal),3),
        TotalHeadloss_max: toP(d3.max(v,d=>d.generation.calc2.headlossTotal),3),
        HeadlossProportion_mean: toP(d3.mean(v,d=>d.generation.calc2.headlossProportion),2),
        HeadlossProportion_min: toP(d3.min(v,d=>d.generation.calc2.headlossProportion),2),
        HeadlossProportion_max: toP(d3.max(v,d=>d.generation.calc2.headlossProportion),2),
        NetHead_mean: toP(d3.mean(v,d=>d.generation.calc2.netHead),4),
        NetHead_min: toP(d3.min(v,d=>d.generation.calc2.netHead),4),
        NetHead_max: toP(d3.max(v,d=>d.generation.calc2.netHead),4),
        UnitEfficiency_mean: toP(d3.mean(v,d=>d.generation.calc2.unitEfficiency),3),
        UnitEfficiency_min: toP(d3.min(v,d=>d.generation.calc2.unitEfficiency),3),
        UnitEfficiency_max: toP(d3.max(v,d=>d.generation.calc2.unitEfficiency),3),
        GeneratorEfficiency_mean: toP(d3.mean(v,d=>d.generation.calc2.generatorEfficiency),3),
        GeneratorEfficiency_min: toP(d3.min(v,d=>d.generation.calc2.generatorEfficiency),3),
        GeneratorEfficiency_max: toP(d3.max(v,d=>d.generation.calc2.generatorEfficiency),3),
        TotalEfficiency_mean: toP(d3.mean(v,d=>d.generation.calc2.totalEfficiency),3),
        TotalEfficiency_min: toP(d3.min(v,d=>d.generation.calc2.totalEfficiency),3),
        TotalEfficiency_max: toP(d3.max(v,d=>d.generation.calc2.totalEfficiency),3),
        UnitPower_mean: toP(d3.mean(v,d=>d.generation.calc2.unitPower),4),
        UnitPower_min: toP(d3.min(v,d=>d.generation.calc2.unitPower),4),
        UnitPower_max: toP(d3.max(v,d=>d.generation.calc2.unitPower),4),
        GeneratorPower_mean: toP(d3.mean(v,d=>d.generation.calc2.generatorPower),4),
        GeneratorPower_min: toP(d3.min(v,d=>d.generation.calc2.generatorPower),4),
        GeneratorPower_max: toP(d3.max(v,d=>d.generation.calc2.generatorPower),4),
        LowFlowShutoffDays: v.filter(d=>d.generation.shutoffLowFlow).length,
        HighHeadShutoffDays: v.filter(d=>d.generation.shutoffHighHead).length, 
        LowHeadShutoffDays: v.filter(d=>d.generation.shutoffLowHead).length,
        LowFlowShutoffProportion: toP(v.filter(d=>d.generation.shutoffLowFlow).length/v.length,3),
        HighHeadShutoffProportion: toP(v.filter(d=>d.generation.shutoffHighHead).length/v.length,3),
        LowHeadShutoffProportion: toP(v.filter(d=>d.generation.shutoffLowHead).length/v.length,3),
        CapFactor: toP(d3.sum(v,d=>d.generation.calc2.plantEnergy)/(parameters.plantCapacity*24*v.length),3)
      }
      ret.ShutoffProportion = toP((ret.LowFlowShutoffDays + ret.HighHeadShutoffDays + ret.LowHeadShutoffDays)/v.length,3)
      ret.BypassVolume = toP(ret.RiverVolume - ret.CanalVolume,4)
      ret.EFlowProportion = toP(ret.EFlowVolume/ret.RiverVolume,2)
      ret.GenerationProportion = toP(ret.CanalVolume/ret.RiverVolume,2)
      ret.BypassProportion = toP(1-ret.GenerationProportion,2)
      ret.SpecificEnergy = toP(ret.Energy/ret.RiverVolume/1000,3) //Mwh per km3
      return ret
    },d=>fKey(d)).map(v=>v[1])
  }
  const monthly = aggregate(dys, d=>d.datetime.startOf('month'))
  monthly.forEach(d=>delete d.WaterWeek)
  //console.log(monthly[1])

  const weekly = aggregate(dys, d=>d.datetime.startOf('week'))
  //console.log(weekly[1])

  function aggregateYearly(dys, fKey) {
    return d3.rollups(dys, v=>{
      let ret = {
        WaterYear: v[0].waterYear,
        Year: v[0].datetime.year,
        Days: v.length,
        Energy: toP(d3.sum(v,d=>d.generation.calc2.plantEnergy)/1000,4), //MWh
        Power_max: toP(d3.max(v,d=>d.generation.calc2.plantPower),4),
        Power_min: toP(d3.min(v,d=>d.generation.calc2.plantPower),4),
        Power_mean: toP(d3.mean(v,d=>d.generation.calc2.plantPower),4),
        Flow_mean: toP(d3.mean(v,d=>d.flow),4),
        Flow_min: toP(d3.min(v,d=>d.flow),4),      
        Flow_max: toP(d3.max(v,d=>d.flow),4),
        RiverVolume: toP(d3.sum(v,d=>d.flow)*24*60*60/1000/1000/1000,3), //km3
        EFlowVolume: toP(d3.sum(v,d=>d.flows.eFlows.total)*24*60*60/1000/1000/1000,3), //km3
        CanalVolume: toP(d3.sum(v,d=>d.flows.canal)*24*60*60/1000/1000/1000,3), //km3
        Power_max: toP(d3.max(v,d=>d.generation.calc2.plantPower),4),
        Power_min: toP(d3.min(v,d=>d.generation.calc2.plantPower),4),
        Power_mean: toP(d3.mean(v,d=>d.generation.calc2.plantPower),4),
        EFlowProportion_mean: toP(d3.mean(v,d=>d.flows.eFlowProportion),3),
        EFlowProportion_min: toP(d3.min(v,d=>d.flows.eFlowProportion),3),
        EFlowProportion_max: toP(d3.max(v,d=>d.flows.eFlowProportion),3),
        LowFlowShutoffDays: v.filter(d=>d.generation.shutoffLowFlow).length,
        HighHeadShutoffDays: v.filter(d=>d.generation.shutoffHighHead).length, 
        LowHeadShutoffDays: v.filter(d=>d.generation.shutoffLowHead).length,
        LowFlowShutoffProportion: toP(v.filter(d=>d.generation.shutoffLowFlow).length/365,2),
        HighHeadShutoffProportion: toP(v.filter(d=>d.generation.shutoffHighHead).length/365,2),
        LowHeadShutoffProportion: toP(v.filter(d=>d.generation.shutoffLowHead).length/365,2),
        CapFactor: toP(d3.sum(v,d=>d.generation.calc2.plantEnergy)/(parameters.plantCapacity*24*365),3),
        Proportion4Units: toP(v.filter(d=>d.generation.calc2.units==4).length/365,2),
        Proportion3Units: toP(v.filter(d=>d.generation.calc2.units==3).length/365,2),
        Proportion2Units: toP(v.filter(d=>d.generation.calc2.units==2).length/365,2),
        Proportion1Units: toP(v.filter(d=>d.generation.calc2.units==1).length/365,2),
        Proportion0Units: toP(v.filter(d=>d.generation.calc2.units==0).length/365,2)
      }
      ret.ShutoffDays = ret.LowFlowShutoffDays + ret.HighHeadShutoffDays + ret.LowHeadShutoffDays
      ret.ShutoffDaysProportion = ret.ShutoffDays/365
      ret.BypassVolume = toP(ret.RiverVolume - ret.CanalVolume,4)
      ret.EFlowProportion = toP(ret.EFlowVolume/ret.RiverVolume,2)
      ret.GenerationProportion = toP(ret.CanalVolume/ret.RiverVolume,2)
      ret.BypassProportion = toP(1-ret.GenerationProportion,2)
      ret.SpecificEnergy = toP(ret.Energy/ret.RiverVolume,3) //Mwh per km3
      return ret
    },d=>fKey(d)).map(v=>v[1])
  }

  const yearly = aggregateYearly(dys, d=>d.waterYear)
  yearly.forEach(v=>delete v.Year)
  //console.log(yearly[1])

  const calendarYearly = aggregateYearly(dys, d=>d.datetime.year)
  calendarYearly.forEach(v=>delete v.WaterYear)
  console.log(calendarYearly[1])

  const annualExceedances = [...Array(101).keys()].map(v=> {
    return {
      Exceedance: v/100,
      Energy: toP(d3.quantile(yearly, 1-(v/100), d=>d.Energy),4),
      RiverVolume: toP(d3.quantile(yearly, 1-(v/100), d=>d.RiverVolume),3),
      CapFactor: toP(d3.quantile(yearly, 1-(v/100), d=>d.CapFactor),3),
      EFlowProportion: toP(d3.quantile(yearly, 1-(v/100), d=>d.EFlowProportion),3),
      SpecificEnergy: toP(d3.quantile(yearly, 1-(v/100), d=>d.SpecificEnergy),3),
      ShutoffDaysProportion: toP(d3.quantile(yearly, 1-(v/100), d=>d.ShutoffDaysProportion),3)
    }
  })
  //console.log(annualExceedances)

  const dailyExceedances = [...Array(101).keys()].map(v=> {
    return {
      Exceedance: v/100,
      Power: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.plantPower),3),
      Energy: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.plantEnergy),3),
      // RiverFlow: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.river),3),
      // EFlow: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.eFlows.total),3),
      // EFlowProportion: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.eFlowProportion),3),
      // CanalFlow: toP(d3.quantile(dys, 1-(v/100), d=>d.flows.canal),3),
      // HeadPondLevel: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.headpond),3),
      // TailwaterLevel: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.tailwaterLevel),3),
      // GrossHead: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.grossHead),3),
      // LeftChannelHeadloss: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.headlosses.leftchannel),3),
      // CanalHeadloss: toP(d3.quantile(dys, 1-(v/100), d=>d.levels.headlosses.canal),3),
      // TotalHeadloss: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.headlossTotal),3),
      // NetHead: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.netHead),3),
      // UnitEfficiency: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.unitEfficiency),3),
      // GeneratorEfficiency: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.generatorEfficiency),3),
      // TotalEfficiency: toP(d3.quantile(dys, 1-(v/100), d=>d.generation.calc2.totalEfficiency),3),
    }
  })
  //console.log(dailyExceedances)

  const monthlyExceedances = [...Array(101).keys()].map(v=> {
    return {
      Exceedance: v/100,
      Flow: toP(d3.quantile(monthly, 1-(v/100), d=>d.Flow_mean),3),
      Power: toP(d3.quantile(monthly, 1-(v/100), d=>d.Power_mean),3),
      Energy: toP(d3.quantile(monthly, 1-(v/100), d=>d.Energy),3),

      GrossHead: toP(d3.quantile(monthly, 1-(v/100), d=>d.GrossHead_mean),3),
      CanalFlow: toP(d3.quantile(monthly, 1-(v/100), d=>d.CanalFlow_mean),3),
      NetHead: toP(d3.quantile(monthly, 1-(v/100), d=>d.NetHead_mean),3),
      TotalEfficiency: toP(d3.quantile(monthly, 1-(v/100), d=>d.TotalEfficiency_mean),3),
      TotalHeadloss: toP(d3.quantile(monthly, 1-(v/100), d=>d.TotalHeadloss_mean),3),

      EFlowProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.EFlowProportion),3),
      GenerationProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.GenerationProportion),3),
      BypassProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.BypassProportion),3),
      SpecificEnergy:toP(d3.quantile(monthly, 1-(v/100), d=>d.SpecificEnergy),3),
      ShutoffProportion: toP(d3.quantile(monthly, 1-(v/100), d=>d.ShutoffProportion),3),

    }
  })
  //console.log(monthlyExceedances)

  const calMonthly = d3.rollups(monthly, v=>{
    let ret = {
      Month: v[0].Month,
      WaterMonth: v[0].WaterMonth,
      Flow_mean: toP(d3.mean(v,d=>d.Flow_mean),4),
      Flow_min: toP(d3.min(v,d=>d.Flow_mean),4),
      Flow_max: toP(d3.max(v,d=>d.Flow_mean),4),
      Energy_max: toP(d3.max(v,d=>d.Energy),4),
      Energy_min: toP(d3.min(v,d=>d.Energy),4),
      Energy_mean: toP(d3.mean(v,d=>d.Energy),4), //MWh
      Power_max: toP(d3.max(v,d=>d.Power_mean),4),
      Power_min: toP(d3.min(v,d=>d.Power_mean),4),
      Power_mean: toP(d3.mean(v,d=>d.Power_mean),4),
      EFlowProportion_mean: toP(d3.mean(v,d=>d.EFlowProportion_mean),2),
      GenerationProportion_mean: toP(d3.mean(v,d=>d.GenerationProportion),2),
      BypassProportion_mean: toP(d3.mean(v,d=>d.BypassProportion),2),
      LowFlowShutoffProportion: toP(d3.mean(v,d=>d.LowFlowShutoffProportion),2),
      HighHeadShutoffProportion: toP(d3.mean(v,d=>d.HighHeadShutoffProportion),2),
      LowHeadShutoffProportion: toP(d3.mean(v,d=>d.LowHeadShutoffProportion),2),
      CapFactor_mean: toP(d3.mean(v,d=>d.CapFactor),2),
      SpecificEnergy_mean: toP(d3.mean(v,d=>d.SpecificEnergy),3),
    }
    return ret
  },d=>d.Month).map(v=>v[1])
  //console.log(calMonthly)

  const calMonthlyEnergyExceedances = [...Array(12).keys()].map(m=> {
    const ret = {
      month: m+1
    }
    const exc=[...Array(101).keys()]
    exc.forEach(e=> {
      ret[d3.format('.2f')(1-(e/100),3)] = toP(d3.quantile(monthly.filter(d=>d.Month==(m+1)), 1-(e/100), d=>d.Energy),5)
    })    
    return ret
  })
  //console.log(calMonthlyEnergyExceedances)

  const statistics = {
    EnergyAnnual_mean: toP(d3.mean(yearly, d=>d.Energy),3),
    EnergyAnnual_P50: toP(d3.quantile(yearly, 0.5, d=>d.Energy),3),
    CapFactor_mean: toP(d3.mean(yearly, d=>d.CapFactor),3)
  }

  return {daily,weekly, monthly, yearly, calMonthly, calMonthlyEnergyExceedances, dailyExceedances, monthlyExceedances, annualExceedances, statistics}
}

function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 