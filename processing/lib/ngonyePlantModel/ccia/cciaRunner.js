import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import plantModel from '../plantModel.js'
import calcPEStatistics from '../statistics.js'

import { baseParams, models, lookupFilesets }  from '../../../data/ngonyePlantModels/modelParameters.js'

const hydrologySet = '2016'
const folder = path.dirname(fileURLToPath(import.meta.url + '/../../../') ) + '/data/'
const plantModelRef = 'base_sh'

const cciaModels=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/ccia/flowModels/cciaModels_' + hydrologySet + '.csv', 'utf-8'), d3.autoType)    

// *****************************************************
// ** Load model plant params based on the modelRef
const modelParams = models.find(v=>v.modelRef==plantModelRef)
if (!modelParams) { throw new Error(`Model not found with ref '${modelRef}'`) }
const plantModelParams = {...baseParams,...modelParams}
plantModelParams.lookupFileset = lookupFilesets.find(v=>v.ref == plantModelParams.lookupsFileset)

let baseStats = null

cciaModels.forEach((cciaModel,i)=>{
  let runModel = false
  
  if ((cciaModel.EnergyAnnual_mean==null || cciaModel.force || cciaModel.ModelName =='Historic')) {
    runModel = true
  }  

  if (runModel) {
    const start = DateTime.now()

    //Load the CCIA hydrology series
    let cciaHydrology=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/ccia/flowModels/' + hydrologySet + '/' + cciaModel.ModelName + '.csv', 'utf-8'), d3.autoType).map(v=> {
      v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
      return v
    })

    // *******************************************************************************
    // Run the model
    cciaHydrology= plantModel(plantModelParams, cciaHydrology)

    // ***********************
    // ** Calculate statistics
    let stats = calcPEStatistics(plantModelParams, cciaHydrology, true)

    if (cciaModel.ModelName=='Historic') {
      baseStats = stats.statistics
    } else {
      stats.statistics.meanVar = toP((stats.statistics.EnergyAnnual_mean- baseStats.EnergyAnnual_mean)/baseStats.EnergyAnnual_mean,3)
      stats.statistics.P50Var = toP((stats.statistics.EnergyAnnual_P50 - baseStats.EnergyAnnual_P50)/baseStats.EnergyAnnual_P50,3)
    }
     
    cciaModel = {...cciaModel,...stats.statistics}
    cciaModels[i] = cciaModel 
    console.log(cciaModel)

    fs.writeFileSync(folder + 'ngonyePlantModels/ccia/flowModels/cciaModels_' + hydrologySet + '.csv', d3.csvFormat(cciaModels))
     
    console.log(`Ran CCIA model ${cciaModel.ModelName} in ${DateTime.now().diff(start).as('milliseconds')} ms.`)
  } else {
    console.log(`Did not run CCIA model ${cciaModel.ModelName}.`)
  }
}) 

function loadDaily(folder, params) {
  return d3.csvParse(fs.readFileSync(folder + '/syntheticFlowSeries/' + params.hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
    v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
    return v
  })
}

function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 