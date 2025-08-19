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
    hydrologySet:'2024',
  },
  {
    modelRef:'sh_2016_7.8mhead',
    modelName: 'Sinohydro Bid - Minimum head 7.8m',
    description: 'Parameters from Sinohydro bid with minimum head of 7.8m',
    minimumHead: 7.8,
  },
  {
    force: true,
    modelRef:'sh_2024_7.8mhead',
    modelName: 'Sinohydro Bid - Hydrology to 2024 - Minimum head 7.8m',
    description: 'Parameters from Sinohydro bid with 2024 hydrology and minimum head of 7.8m',
    minimumHead: 7.8,
    hydrologySet:'2024',
  },   
  {
    modelRef:'sh_2016_50mwgen',
    modelName: 'Sinohydro Bid - 50MW Generator',
    description: 'Parameters from Sinohydro bid with 50MW generator',
    maxGeneratorOutput: 50,
  },  
  {
    modelRef:'sh_2024_50cmhead',
    modelName: 'Sinohydro Bid - 50cm Head Increase',
    description: 'Parameters from Sinohydro bid, 2024 hydrology with 50cm headpond lift',
    hydrologySet:'2024',
    headpondLift: 0.5,
    maximumHead: 25.9,
  },  
  { 
    modelRef:'sh_2024_allCs',
    modelName: 'Sinohydro Bid - Lower EFlows',
    description: 'Parameters from Sinohydro bid, 2024 hydrology with eFlows all Cs',
    hydrologySet:'2024',
    ewrCategorySet: 'All Cs',
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
    modelRef:'base_fs_2024',
    modelName: 'Base Case FS - Hydrology to 2024',
    description: 'Base case model as presented to EPC bidders with FS parameters  - Hydrology to 2024',
    hydrologySet:'2024',
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