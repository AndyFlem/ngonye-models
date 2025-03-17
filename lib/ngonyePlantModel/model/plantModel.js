
import { channel } from 'diagnostics_channel'
import flowsModelSetup from './flowsModel.js'
import levelsAndLossesModelSetup from './levelsAndLossesModel.js'
import powerAndEnergyModelSetup from './powerAndEnergyModel.js'

// MODEL COMPONENTS
// ****************************************
// PlantModel: Main model that calculates the power and energy for each day (possibly twice with differing number of turbines)
// -- FlowsModel: Calculates the flows in each channel, and the canal flow
//    -- eFlowsModel: Calculates the eFlows in each channel
// -- LevelsAndLossesModel: Calculates the headpond and tailwater levels and the headlosses. Separate function to calculate the turnine headlosses
// -- PowerAndEnergyModel: Calculates the power and energy for the day

// Statistics: Calculates aggregates and summary statistics over the model results as flat files
// eFlowsSetup: Calculates exceedances for measurement dates and annotates a flow series with eFlows data


// DATA STRUCTURE
// ****************************************
// [ array of days
//   {
//   date: 1932-11-01T00:00:00.000Z,
//   flow: 199,
//   ....other data on the date and eFlows annotations
//   flows: {
//     eFlows: { by channel },
//     ...other flow data
//     canal: 106,
//     spill: { by channel },
//     channels: { total channel flows by channel}
//   },
//   levels: {
//     ... headpond, tailwater and gross head
//     headlosses: {}
//   },
//   generation: {
//     ... shutoff markers
//     calc1: { units, unit flow, unit headloss, net head, efficiency, power, energy },
//     calc2: {units, unit flow, unit headloss, net head, efficiency, power, energy },
//     }
//   }
// }
// ]


// ****************************************
// ** Plant model
// This is the main model that will be called to calculate the power and energy for each day
export default function plantModel(params, daily) {

  // ****************************************
  // ** Setup the models
  // Setup the flows model
  const flowsModel = flowsModelSetup(params)

  // Setup the levels and losses model
  const levelsAndLossesModel = levelsAndLossesModelSetup(params)

  //Setup the power and energy model
  const powerAndEnergyModel = powerAndEnergyModelSetup(params)


  // *******************
  // ** Calculate by day
  daily.forEach(dy=>{
    // *******************************
    // ** Calculate common conditions
    
    // Get the eFlows for each channel, calculate any spill flows, flow available for generation and the canal flow
    dy.flows = flowsModel(dy)
    // Get the headpond and tailwater levels and the headlosses in the canal and the left channel
    dy.levels = levelsAndLossesModel.upstream(dy)

    // ********************************************
    // ** Calculate power without generator limits
    if (!dy.generation) { dy.generation = {} }

    dy.generation.calc1 = {}
    dy.generation.calc1.units = Math.ceil(dy.flows.canal / params.maximumFlowUnit)

    levelsAndLossesModel.unitHeadlosses(dy, dy.generation.calc1)

    powerAndEnergyModel(dy, dy.generation.calc1)

    // *********************************************************
    // ** If necassary, recalculate power with generator limits
    let reCalc = false
    // If this is the FS style model 
    // and the generators are above their rated capacity then increase the number of units in use (if possible)
    if (params.type == 'fs' && dy.generation.calc1.generatorPower>params.maxGeneratorOutput && dy.generation.calc1.units < params.unitsAvailable) {
      dy.generation.generatorConstrained = true
      dy.generation.calc2 = {}
      dy.generation.calc2.units = dy.generation.calc1.units + 1
      
      reCalc = true 
    }

    // For the Sino/Andritz hillchart then increase number of turbines in use (if possible)
    // if in the first calculation the units were beyond the overload line (high flow, high head)
    if (params.type == 'sh') { 
      dy.generation.calc2 = {}

      if (dy.generation.calc1.units < params.unitsAvailable && isOverload(dy.generation.calc1.netHead, dy.generation.calc1.unitFlow)) {
        dy.generation.calc1.isOverload = true
        dy.generation.calc2.units = dy.generation.calc1.units + 1
      } else {
        dy.generation.calc2.units = dy.generation.calc1.units
      }
      reCalc = true
    }
    
    if (reCalc) {
      levelsAndLossesModel.unitHeadlosses(dy, dy.generation.calc2)
      powerAndEnergyModel(dy, dy.generation.calc2)
    } else {
      dy.generation.calc2 = dy.generation.calc1
    }
  })

  //console.log(daily.find(v=>v.datetime.toISODate() == '1983-11-08'))
  //console.log(daily.find(v=>v.datetime.toISODate() == '1932-11-01')) 
  return daily

  // *****************
  // ** Lib functions
  function isOverload(head, flow) {
    return flow > (head * params.unitLimits.overloadCfs[0]) + params.unitLimits.overloadCfs[1]
  }
}