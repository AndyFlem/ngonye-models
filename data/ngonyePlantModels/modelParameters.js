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
    modelName: 'Base Case - EPC Contract',
    description: 'Parameters from Sinohydro bid with 2024 hydrology and minimum head of 7.8m',
  },
  {
    modelRef:'fs',
    modelName: 'Feasibility Study',
    description: 'Model presented to EPC bidders with FS parameters',
    type: 'fs',
    hydrologySet: '2016',
    minimumHead: 10,
    maximumHeadShutdown: false,
    constrainFinalGeneratorOutput: false,
    lookupsFileset: 'fs'
  }, {
    modelRef:'fs_2024',
    modelName: 'Feasibility Study, 2024 Hydrology',
    description: 'Model presented to EPC bidders with FS parameters and 2024 hydrology',
    type: 'fs',
    hydrologySet: '2024',
    minimumHead: 10,
    maximumHeadShutdown: false,
    constrainFinalGeneratorOutput: false,
    lookupsFileset: 'fs'
  },{
    modelRef:'sh_2024_10mhead',
    modelName: 'Sinohydro Bid - Minimum head 10m',
    description: 'Parameters from Sinohydro bid with minimum head of 7.8m',
    minimumHead: 10,
  },{
    modelRef:'sh_2016_7.8mhead',
    modelName: 'Sinohydro Bid - 2016 Hydrology',
    description: 'Parameters from Sinohydro bid with 2016 hydrology and minimum head of 7.8m',
    hydrologySet: '2016'
  },{
    modelRef:'sh_2024_50mwgen',
    modelName: 'Sinohydro Bid - 50MW Generator',
    description: 'Parameters from Sinohydro bid with 50MW generator',
    maxGeneratorOutput: 50,
  },  
  {
    modelRef:'sh_2024_50mwgen',
    modelName: 'Sinohydro Bid - 50cm Headpond Lift',
    description: 'Parameters from Sinohydro bid with 50cm headpond lift',
    headpondLift: 0.5,
    maximumHead: 25.9,
  },  
  { 
    modelRef:'sh_2024_allCs',
    modelName: 'Sinohydro Bid - Lower EFlows',
    description: 'Parameters from Sinohydro bid with eFlows all Cs',
    ewrCategorySet: 'All Cs',
  },
  {
    modelRef:'sh_2024_25cmtailwater_lift',
    modelName: 'Sinohydro Bid - 25cm Tailwater Lift',
    description: 'Parameters from Sinohydro bid with 25cm tailwater lift',
    tailwaterLift: 0.25,
    maximumHead: 25.9,
  },  
  {
    modelRef:'sh_2024_25cmtailwater_drop',
    modelName: 'Sinohydro Bid - 25cm Tailwater Drop',
    description: 'Parameters from Sinohydro bid with 25cm tailwater drop',
    tailwaterLift: -0.25,
    maximumHead: 25.9,
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