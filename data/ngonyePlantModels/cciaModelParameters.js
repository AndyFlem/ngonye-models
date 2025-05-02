export const baseParams = {
  type: 'sh',
  hydrologySet:'2024',
  ewrCategorySet: 'Recommendation 1',
  tailwaterLift: 0,
  headpondLift: 0,
  plantCapacity: 180,
  unitsAvailable: 4,
  minimumHead: 7.8,
  maximumHead: 25.4,
  maximumHeadShutdown: true,
  minimumFlowUnit: 50,
  maximumFlowUnit: 275,
  ratedFlowUnit: 220,
  ratedTurbineCapacity: 46.5,
  maxGeneratorOutput: 48.2,
  constrainFinalGeneratorOutput: true,
  lookupsFileset: 'sh',
  unitLimits: {
    floodFlowCfs: [18.6, 65],
    overloadCfs: [-10.2, 479]
  }  
}
export const models = [
  {
    force: true,
    modelRef:'sh_2024_7.8mhead',
    modelName: 'Sinohydro Bid - Hydrology to 2024 - Minimum head 7.8m',
    description: '',
  },
  {
    force: true,
    modelRef:'sh_2024_26mmaxhead',
    modelName: 'Sinohydro Bid - Hydrology to 2024 - Maximum head 26m',
    description: '',
    maximumHead: 26
  },  
  {
    force: true,
    modelRef:'sh_2024_26mmaxhead_40minflow',
    modelName: 'Sinohydro Bid - Hydrology to 2024 - Maximum head 26m - Min flow 40',
    description: '',
    maximumHead: 26,
    minimumFlowUnit: 40
  },    
]

export const lookupFilesets = [
  {
    ref: 'fs',
    headlossCanal: 'headloss_canal_fs.csv',
    hillchart: 'hillchart_fs.csv',
    headlossLeftChannel: 'headloss_leftchannel.csv',
    headlossTurbine: 'headloss_turbine_fs.csv',
    tailwaterLevel: 'tailwater_levels.csv',
    eFlowsAssuranceSets: 'eflows_assurance_sets.csv',
    eFlowsChannelFlows: 'eflows_channel_flows.csv',
    channelSpillProportions: 'channel_splill_proportions.csv',
    spillLimits: 'spill_limits.csv',
    generatorEfficiency: 'generator_efficiency.csv'
  }, {
    ref: 'sh',
    headlossCanal: 'headloss_canal_sh.csv',
    hillchart: 'hillchart_sh.csv',
    headlossLeftChannel: 'headloss_leftchannel.csv',
    headlossTurbine: 'headloss_turbine_sh.csv',
    tailwaterLevel: 'tailwater_levels.csv',
    eFlowsAssuranceSets: 'eflows_assurance_sets.csv',
    eFlowsChannelFlows: 'eflows_channel_flows.csv',
    channelSpillProportions: 'channel_splill_proportions.csv',
    spillLimits: 'spill_limits.csv',
    generatorEfficiency: 'generator_efficiency.csv',

  },
  
]