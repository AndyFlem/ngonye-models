import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import plantModel from './model/plantModel.js'
import calcPEStatistics from './model/statistics.js'

import { baseParams, models, lookupFilesets }  from '../../data/ngonyePlantModels/modelParameters.js'

const hydrologySet = '2024'
const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/'
const plantModelRef = 'base_sh'

const cciaModels=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/ccia/cciaModels_' + hydrologySet + '.csv', 'utf-8'), d3.autoType)    

// ** Load model plant params based on the modelRef
const modelParams = models.find(v=>v.modelRef==plantModelRef)
if (!modelParams) { throw new Error(`Model not found with ref '${modelRef}'`) }
const plantModelParams = {...baseParams,...modelParams}
plantModelParams.lookupFileset = lookupFilesets.find(v=>v.ref == plantModelParams.lookupsFileset)

let baseStats = null

// Each of the 40 models - 2 time periods, 2 climate change scenarios and 10 climate change models
cciaModels.forEach((cciaModel,i)=>{

  // Check if we need to run the model
  let runModel = false
  if ((!cciaModel.EnergyAnnual_mean || cciaModel.EnergyAnnual_mean==null || cciaModel.force || cciaModel.ModelName =='Historic')) {
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
    console.log(cciaHydrology[0])
    let stats = calcPEStatistics(plantModelParams, cciaHydrology, true)

    // Add comparisons to the base, Historic model
    if (cciaModel.ModelName=='Historic') {
      baseStats = stats.statistics
    } else {
      stats.statistics.meanVar = toP((stats.statistics.EnergyAnnual_mean- baseStats.EnergyAnnual_mean)/baseStats.EnergyAnnual_mean,3)
      stats.statistics.P50Var = toP((stats.statistics.EnergyAnnual_P50 - baseStats.EnergyAnnual_P50)/baseStats.EnergyAnnual_P50,3)
    }
     
    cciaModel = {...cciaModel,...stats.statistics}
    cciaModels[i] = cciaModel 
    //console.log(cciaModel)

    // Write out the model summary results
    fs.writeFileSync(folder + 'ngonyePlantModels/ccia/cciaModels_' + hydrologySet + '.csv', d3.csvFormat(cciaModels))
    
    // Write out the detailed results
    let outFolder = folder + 'ngonyePlantModels/ccia/plantModels/' + hydrologySet + '/' + cciaModel.ModelName + '/'
    if (!fs.existsSync(outFolder)) {
      fs.mkdirSync(outFolder, { recursive: true })
    }
    fs.writeFileSync(outFolder + plantModelRef +  + '_pe_daily.json', JSON.stringify(cciaHydrology, null, 2))
    fs.writeFileSync(outFolder + plantModelRef + '_pe_daily.csv', d3.csvFormat(stats.daily))
    fs.writeFileSync(outFolder + plantModelRef + '_pe_yearly.csv', d3.csvFormat(stats.yearly))
    fs.writeFileSync(outFolder + plantModelRef + '_pe_monthly.csv', d3.csvFormat(stats.monthly))
    fs.writeFileSync(outFolder + plantModelRef + '_pe_weekly.csv', d3.csvFormat(stats.weekly))

    fs.writeFileSync(outFolder + plantModelRef + '_pe_calmonthly.csv', d3.csvFormat(stats.calMonthly))
    fs.writeFileSync(outFolder + plantModelRef + '_pe_calmonthlyenergyexceedances.csv', d3.csvFormat(stats.calMonthlyEnergyExceedances))

    fs.writeFileSync(outFolder + plantModelRef + '_pe_monthlyexceedances.csv', d3.csvFormat(stats.monthlyExceedances))
    fs.writeFileSync(outFolder + plantModelRef + '_pe_annualexceedances.csv', d3.csvFormat(stats.annualExceedances)) 


    console.log(`Ran CCIA model ${cciaModel.ModelName} in ${DateTime.now().diff(start).as('milliseconds')} ms.`)
  } else {
    console.log(`Did not run CCIA model ${cciaModel.ModelName}.`)
  }
})

function toP(num, precision) {
  return Number(num.toPrecision(precision))
} 