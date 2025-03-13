import * as d3 from 'd3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DateTime } from 'luxon'

import plantModel from './plantModel.js'
import eFlowsSetup from './eFlowsSetup.js'
import calcPEStatistics from './statistics.js'
import { baseParams, models, lookupFilesets }  from '../../data/ngonyePlantModels/modelParameters.js'

const folder = path.dirname(fileURLToPath(import.meta.url + '/../../') ) + '/data/'

// *****************************************************
// Check if the modelStatistics output file exists
let modelsReport = []
if (fs.existsSync(folder + 'ngonyePlantModels/models/modelStatistics.csv')) {
  modelsReport=d3.csvParse(fs.readFileSync(folder + 'ngonyePlantModels/models/modelStatistics.csv', 'utf-8'), d3.autoType)    
}

models.forEach(model=>{
  const modelRef = model.modelRef

  let runModel = false
  
  const modelsReportIndx = modelsReport.findIndex(v=>v.modelRef==modelRef)
  if (modelsReportIndx == -1) {
    runModel = true
  } else {
    if (modelsReport[modelsReportIndx].EnergyAnnual_mean==null) {
      runModel = true
    }
    if (model.force) {
      runModel = true
    }
  }

  if (runModel) {
    const start = DateTime.now()
  
    // create the output folder if it does not exist
    if (!fs.existsSync(folder + 'ngonyePlantModels/models/' + modelRef)) {
      fs.mkdirSync(folder + 'ngonyePlantModels/models/' + modelRef, { recursive: true })
    }

    // *****************************************************
    // ** Load model params based on the modelRef
    const modelParams = models.find(v=>v.modelRef==modelRef)
    if (!modelParams) { throw new Error(`Model not found with ref '${modelRef}'`) }
    const params = {...baseParams,...modelParams}
    params.lookupFileset = lookupFilesets.find(v=>v.ref == params.lookupsFileset)
    //console.log(params)

    // ********************
    // Load daily flow data
    let daily = d3.csvParse(fs.readFileSync(folder + '/syntheticFlowSeries/' + params.hydrologySet + '/processed/daily.csv', 'utf-8'), d3.autoType).map(v=> {
      v.datetime = DateTime.fromJSDate(v.date).minus({hours: 2})
      return v
    })  
    daily.map((v,i)=>v.index=i) 

    // *******************************************************************************
    // Recalculate the eFlows exceedance values for the daily flow series (if needed)
    const recalculateEFlows = false
    if (!daily[0].ewrExceedance || recalculateEFlows) {
      // Calculate the eFlows setup values
      daily = eFlowsSetup(daily)
      // Save the daily flow data
      fs.writeFileSync(folder + '/syntheticFlowSeries/' + params.hydrologySet + '/processed/daily.csv', d3.csvFormat(daily))
    }    

    // *******************************************************************************
    // Run the model
    daily= plantModel(params, daily)
    console.log(`Ran model ${modelRef} in ${DateTime.now().diff(start).as('milliseconds')} ms.`)

    // ***********************
    // ** Calculate statistics
    let stats = calcPEStatistics(params, daily)
  
    // **********************
    // ** Save the results
    const report = {...params,...stats.statistics}
    delete report.lookupFileset
    delete report.unitLimits
    if (modelsReportIndx==-1) {
      modelsReport.push((report))
    } else {
      modelsReport[modelsReportIndx]=report
    }
  
    console.log(stats.statistics)
    fs.writeFileSync(folder + 'ngonyePlantModels/models/modelStatistics.csv', d3.csvFormat(modelsReport))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_daily.csv', d3.csvFormat(stats.daily))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_yearly.csv', d3.csvFormat(stats.yearly))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_monthly.csv', d3.csvFormat(stats.monthly))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_weekly.csv', d3.csvFormat(stats.weekly))

    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_calmonthly.csv', d3.csvFormat(stats.calMonthly))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_calmonthlyenergyexceedances.csv', d3.csvFormat(stats.calMonthlyEnergyExceedances))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_dailyexceedances.csv', d3.csvFormat(stats.dailyExceedances))

    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_monthlyexceedances.csv', d3.csvFormat(stats.monthlyExceedances))
    fs.writeFileSync(folder + 'ngonyePlantModels/models/' + params.modelRef + '/' + params.modelRef + '_pe_annualexceedances.csv', d3.csvFormat(stats.annualExceedances)) 
  } else {
    console.log(`Not running model ${modelRef}`)
  }
})
