export const models = [
  {
    modelRef:'base',
    modelName: 'Base Case',
    description: 'Base case model as presented to EPC bidders',
    ewrCategorySet: 'Recommendation 1',
    tailwaterLift: 0,
    headpondLift: 0,
    plantCapacity: 180,
    unitsAvailable: 4,
    minimumHead: 10,
    maximumHead: 25.4,
    maximumHeadShutdown: false,
    minimumFlowUnit: 50,
    maximumFlowUnit: 275,
    ratedFlowUnit: 220,
    ratedTurbineCapacity: 49.1,
    maxGeneratorOutput: 48.2,
    constrainFinalGeneratorOutput: false,
    lookupsFileset: 'fs'
  },  {
    modelRef:'base_sh',
    modelName: 'Base Case Sinohydro Bid',
    description: 'Base case model as with parameters from Sinohydro bid',
    ewrCategorySet: 'Recommendation 1',
    tailwaterLift: 0,
    headpondLift: 0,
    plantCapacity: 180,
    unitsAvailable: 4,
    minimumHead: 10,
    maximumHead: 25.4,
    maximumHeadShutdown: false,
    minimumFlowUnit: 50,
    maximumFlowUnit: 275,
    ratedFlowUnit: 220,
    ratedTurbineCapacity: 46.5,
    maxGeneratorOutput: 48.2,
    constrainFinalGeneratorOutput: true,
    lookupsFileset: 'sh'
  }

]

export const lookupFilesets = [
  {
    ref: 'fs',
    type: 'fs',
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
  },
  
  {
    ref: 'sh',
    type: 'sh',
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
    unitLimits: {
      floodFlowCfs: [18.6, 65],
      overloadCfs: [-10.2, 479]
    }
  },
  
]