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
    lookupsFileset: 'fs'
  }
]

export const lookupFilesets = [
  {
    ref: 'fs',
    headlossCanal: 'headloss_canal_fs.csv',
    hillchart: 'hillchart_fs.csv',
    headlossLeftChannel: 'headlosss_leftchannel.csv',
    headlossTurbine: 'headloss_turbine_fs.csv',
    tailwaterLevel: 'tailwater_levels.csv',
    eFlowsAssuranceSets: 'eflows_assurance_sets.csv',
    eFlowsChannelFlows: 'eflows_channel_flows.csv'
  },
  {
    ref: 'sh',
    headlossCanal: 'headloss_canal_sh.csv',
    hillchart: 'hillchart_sh.csv',
    headlossLeftChannel: 'headlosss_leftchannel.csv',
    headlossTurbine: 'headloss_turbine_sh.csv',
    tailwaterLevel: 'tailwater_levels.csv',
    eFlowsAssuranceSets: 'eflows_assurance_sets.csv',
    eFlowsChannelFlows: 'eflows_channel_flows.csv'
  },
  
]