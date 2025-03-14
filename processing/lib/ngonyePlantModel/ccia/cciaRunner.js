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

cciaModels.forEach((cciaModel,i)=>{
  let runModel = false
  
  if (i==0 && (cciaModel.energyAnnualMean==null || cciaModel.force)) {
    runModel = true
  }

  if (runModel) {
    const start = DateTime.now()
  
    // create the output folder if it does not exist
    if (!fs.existsSync(folder + 'ngonyePlantModels/ccia/results' + hydrologySet + '/' + cciaModel.ModelName)) {
      fs.mkdirSync(folder + 'ngonyePlantModels/ccia/results' + hydrologySet + '/' + cciaModel.ModelName, { recursive: true })
    }

    //Load the CCIA hydrology series
    const cciaHydrology=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/ccia/flowModels/' + hydrologySet + '/' + cciaModel.ModelName + '.csv', 'utf-8'), d3.autoType)

    // *******************************************************************************
    // Run the model
    cciaHydrology= plantModel(plantModelParams, cciaHydrology)
    console.log(`Ran model ${modelRef} in ${DateTime.now().diff(start).as('milliseconds')} ms.`)

    // ***********************
    // ** Calculate statistics
    let stats = calcPEStatistics(plantModelParams, cciaHydrology)
    console.log(stats.statistics)
  }
})
//     // **********************
//     // ** Save the results
//     const report = {...params,...stats.statistics}
//     delete report.lookupFileset
//     delete report.unitLimits
//     if (modelsReportIndx==-1) {
//       modelsReport.push((report))
//     } else {
//       modelsReport[modelsReportIndx]=report
//     }
  

//     fs.writeFileSync(folder + 'ngonyePlantModels/models/modelStatistics.csv', d3.csvFormat(modelsReport))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_daily.csv', d3.csvFormat(stats.daily))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_yearly.csv', d3.csvFormat(stats.yearly))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_monthly.csv', d3.csvFormat(stats.monthly))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_weekly.csv', d3.csvFormat(stats.weekly))

//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_calmonthly.csv', d3.csvFormat(stats.calMonthly))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_calmonthlyenergyexceedances.csv', d3.csvFormat(stats.calMonthlyEnergyExceedances))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_dailyexceedances.csv', d3.csvFormat(stats.dailyExceedances))

//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_monthlyexceedances.csv', d3.csvFormat(stats.monthlyExceedances))
//     fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_annualexceedances.csv', d3.csvFormat(stats.annualExceedances)) 
//   } else {
//     console.log(`Not running model ${modelRef}`)
//   }
// })

function loadDaily(folder, params) {
  return d3.csvParse(fs.readFileSync(folder + '/syntheticFlowSeries/' + params.hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
    v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
    return v
  })  
}