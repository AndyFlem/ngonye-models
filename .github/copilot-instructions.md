# Ngonye Falls Models - AI Coding Agent Instructions

## Project Overview
This is a Node.js modeling suite for simulating hydropower generation at Ngonye Falls, Zambia. It integrates hydrological data, environmental flow requirements, and physical plant constraints to forecast power and energy generation across multiple operational scenarios.

## Architecture: Four-Layer Model Pipeline

The codebase implements a composable pipeline of models:

1. **Hydrology Layer** (`lib/ngonyeFlow/`) - Processes raw gauge data into synthetic daily flow series
   - Input: CSV gauge measurements (Victoria Falls, Sioma/Ngonye gauges)
   - Processing: Stage-discharge conversion (`flow = 1093.0355 * (level - 2.85)^1.659`)
   - Output: Daily flows with water year annotations in `data/syntheticFlowSeries/{year}/processed/daily.csv`

2. **Environmental Flows Layer** (`lib/ngonyePlantModel/model/eFlowsModel.js`, `eFlowsSetup.js`)
   - Determines minimum flows required per river channel based on ecological assurance levels
   - Looks up data from `data/ngonyePlantModels/lookups/eflows_*.csv`
   - Annotates daily data with `ewrFlowBandNumber`, `ewrFlowBand`, and per-channel eFlow requirements

3. **Plant Operations Layer** (`lib/ngonyePlantModel/model/`) - Core physics models
   - **Flows Model**: Distributes river flow into eFlows (environmental), generation, and spillage by channel
   - **Levels & Losses Model**: Calculates headpond/tailwater levels and headlosses (turbine, canal, left channel)
   - **Power/Energy Model**: Calculates turbine efficiency curves and daily generation

4. **Statistics & Output Layer** (`lib/ngonyePlantModel/model/statistics.js`)
   - Aggregates daily results into 500+ metrics saved to CSV per model run
   - Computes annual/monthly/water-week summaries

## Data Flow Architecture

```
Daily gauge data (CSV)
  ↓
Synthetic flow series builder (syntheticFlowSeries.js)
  ↓
Daily flows + water year annotations
  ↓
plantModel() [orchestrator]
  ├─→ eFlowsSetup() [annotate eflow bands]
  ├─→ For each day:
  │   ├─→ flowsModel() [split flows by channel]
  │   ├─→ levelsAndLossesModel() [calculate heads]
  │   └─→ powerAndEnergyModel() [generate power]
  └─→ statistics() [aggregate to CSV output]
```

## Key Data Structures

### Daily Record Format
Each day object flows through the pipeline with cumulative annotations:
```javascript
{
  date: '2024-01-01T00:00:00.000Z',
  datetime: DateTime,           // Luxon DateTime
  flow: 1500,                   // River flow (m³/s)
  waterYear: 2024,              // October-September water year
  waterMonth: 1,
  FDCPercentile: 65,            // Flow duration curve percentile
  ewrFlowBand: "B",             // Environmental water requirement band
  ewrFlowBandNumber: 2,
  flows: {                       // Added by flowsModel()
    eFlows: { channelA, channelC, channelD, channelE, channelFG, total },
    canal: 500,
    spill: { channelA, channelC, channelD, channelE, channelFG, total },
    channels: { channelA, channelC, channelD, channelE, channelFG, left }
  },
  levels: {                      // Added by levelsAndLossesModel()
    headpond: 678.5,
    tailwaterLevel: 651.2,
    grossHead: 27.3,
    headlosses: { leftchannel, canal, canalProportion, upstream, upstreamProportion }
  },
  generation: {                  // Added by powerAndEnergyModel()
    units: 4,
    calc1: { units, unitFlow, netHead, efficiency, power, energy },
    calc2: { units, unitFlow, netHead, efficiency, power, energy }
  }
}
```

## Model Parameterization Pattern

Models are defined in `data/ngonyePlantModels/modelParameters.js`:
- `baseParams`: Default parameters shared across all models
- `models[]`: Array of model variants, merging baseParams with overrides via spread operator
- `lookupFilesets`: Maps to different turbine/efficiency curves (e.g., 'sh' vs 'fs')

Each model run compares against `data/ngonyePlantModels/models/modelStatistics.csv`. If a model's `energyAnnualMean` is null or `force: true`, it reruns.

## File Organization Patterns

- **Data sources** live in `data/` (CSVs, JSON configuration, lookup tables)
- **Model code** in `lib/ngonyePlantModel/model/` follows 1:1 naming with data layers
- **Setup vs run**: Functions named `*Setup()` are called once per model (initialize lookups), returning a function called daily
- **Lookups** always in `data/ngonyePlantModels/lookups/` and loaded via CSV parser with d3.autoType for type inference

## Import Conventions

- Use ES6 `import`/`export` (note `"type": "module"` in package.json)
- `import * as d3 from 'd3'` for data operations (parsing, bisect, mean, min, max, groups, autoType)
- `import { DateTime } from 'luxon'` for date math and water year calculations
- `import fs from 'fs'` and `import path from 'path'` for file I/O
- Use `fileURLToPath(import.meta.url)` to resolve __dirname in ES modules

## Common Functions & Utilities

**`lib/library.js`**:
- `movingAverage(values, N)` / `movingAverage2()` - Centered moving averages
- `interpolate(data, xs, ys, x)` - Linear interpolation for lookup tables
- `interpolate2d(ZValues, X, Y)` - Bilinear interpolation for hillcharts/efficiency curves

**Helper**: `toP(value, decimals)` - Precision trimming (used throughout statistics.js)

## Workflow: Running Models

### Standard Model Runs

```bash
# From scripts/ directory
./runner.sh  # Watches lib/ngonyePlantModel/modelRunner.js and related files, runs on change
# or directly:
node ../lib/ngonyePlantModel/modelRunner.js
```

The runner:
1. Loads all models from `modelParameters.js`
2. For each model: checks if `energyAnnualMean` exists in output CSV
3. If missing/null or `force: true`, loads hydrology set and reruns plantModel()
4. Writes daily results to `data/ngonyePlantModels/models/{modelRef}/daily.csv`
5. Writes aggregated stats to `data/ngonyePlantModels/models/modelStatistics.csv`

### Climate Change Impact Assessment (CCIA) Runs

CCIA model runs assess hydropower generation under multiple climate change scenarios. The workflow has two stages:

**Stage 1: Setup & Flow Annotation** (`cciaSetup.js`)
- Loads raw CCIA flow data from `data/ngonyePlantModels/ccia/Ngonye_CC_flows_combined.csv`
- Contains multiple climate models × scenarios (e.g., 2 time periods × 2 SSP scenarios × 10 climate models = 40+ flows)
- Calculates water year, FDC percentiles, and environmental flow bands for each CCIA scenario
- Outputs annotated daily flows to `data/ngonyePlantModels/ccia/flowModels/{hydrologySet}/{modelName}.csv`
- Configuration: Adjust `hydrologySet` in cciaSetup.js to process different baseline periods

**Stage 2: Plant Operations & Statistics** (`cciaRunner.js` or `cciaScenariosRunner.js`)
- Runs each CCIA flow series through the plant model pipeline (same physics as standard runs)
- Compares each scenario's generation to historic baseline and calculates variance (`meanVar`, `P50Var`)
- Outputs:
  - Summary statistics to `data/ngonyePlantModels/ccia/cciaModels_{hydrologySet}.csv`
  - Daily details to `data/ngonyePlantModels/ccia/plantModels/{scenarioName}/_pe_daily.csv`
  - Aggregated to `_pe_yearly.csv`, `_pe_monthly.csv`, `_pe_weekly.csv`, `_pe_calmonthly.csv`

**Key Parameters** in runner files:
- `cciaRunner.js`: Fixed to run a single plant model against all CCIA flows (configured via `plantModelRef`)
- `cciaScenariosRunner.js`: Runs multiple plant models (from `cciaModelParameters.js`) against a specific climate scenario, allowing parameter sensitivity analysis
- Set `cciaFlowSSPRef`, `cciaForecastPeriod`, `cciaFlowModelRef` to select which CCIA flow scenario to run against

```bash
# From scripts/ directory
./cciaRunner.sh  # Watches CCIA-related files, runs Stage 2 automatically
```

## Common Modifications

- **Change turbine curves**: Edit `data/ngonyePlantModels/lookups/hillchart_*.csv` or `generator_efficiency.csv`
- **Add a scenario**: Add entry to `models[]` in `modelParameters.js` with parameter overrides
- **Adjust eFlow rules**: Modify `data/ngonyePlantModels/lookups/eflows_*.csv`
- **Add metrics**: Extend `statistics()` function to calculate new aggregates (also add to daily.csv extraction)

## Critical Gotchas

- **Water year boundary**: Water year runs October-September; ensure `waterYear` calculation is consistent
- **DateTime handling**: All flow data must be at midnight UTC. ModelRunner checks and corrects if needed.
- **Spill validation**: Code throws if spill is negative (indicates flow conservation error)
- **Generator constraints**: Multiple tuning flags (`constrainFinalGeneratorOutput`, `maximumHeadShutdown`, etc.) affect power calculation—review `powerAndEnergyModel.js` when output unexpectedly changes
- **CSV autoType**: d3.autoType infers booleans, numbers—confirm lookups parse as expected (particularly channel identifiers that might be numeric)
