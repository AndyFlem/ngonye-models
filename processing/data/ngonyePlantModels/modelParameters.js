export const baseParams = {
  type: 'sh',
  hydrologySet:'2016',
  ewrCategorySet: 'Recommendation 1',
  tailwaterLift: 0,
  headpondLift: 0,
  plantCapacity: 180,
  unitsAvailable: 4,
  minimumHead: 10,
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
    modelRef:'base_sh',
    modelName: 'Base Case Sinohydro Bid',
    description: 'Base case model as with parameters from Sinohydro bid',
  },
  {
    modelRef:'base_sh_2024',
    modelName: 'Base Case Sinohydro Bid - Hydrology to 2024',
    description: 'Base case model as with parameters from Sinohydro bid',
  },  
  {
    modelRef:'base_fs',
    modelName: 'Base Case FS',
    description: 'Base case model as presented to EPC bidders with FS parameters',
    type: 'fs',
    maximumHeadShutdown: false,
    constrainFinalGeneratorOutput: false,
    lookupsFileset: 'fs'
  },
  {
    modelRef:'base_fs',
    modelName: 'Base Case FS - Hydrology to 2024',
    description: 'Base case model as presented to EPC bidders with FS parameters  - Hydrology to 2024',
    hydrologySet:'2016',
    type: 'fs',
    maximumHeadShutdown: false,
    constrainFinalGeneratorOutput: false,
    lookupsFileset: 'fs'
  }

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