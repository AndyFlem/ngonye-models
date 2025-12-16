# Ngonye Falls Hydropower Models

A Node.js modeling suite for simulating hydropower generation at Ngonye Falls, Zambia. This project integrates hydrological data, environmental flow requirements, and physical plant constraints to forecast power and energy generation across multiple operational scenarios.

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Running Models](#running-models)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Common Tasks](#common-tasks)
- [Important Notes](#important-notes)

## Quick Start

```bash
# Install dependencies
npm install

# Run standard models (from scripts/ directory)
./runner.sh

# Run climate change impact assessment models
./cciaRunner.sh
```

## Project Overview

Ngonye Falls is a hydropower generation site in Zambia. This modeling suite simulates power generation by considering:

- **Historical river flows** from gauge measurements at Victoria Falls and Sioma/Ngonye
- **Environmental requirements** - minimum flows that must be maintained in different river channels for ecological reasons
- **Physical constraints** - turbine efficiency, head losses, generator capacity, and channel limitations
- **Operational scenarios** - various plant configurations and settings to evaluate performance under different conditions

The models produce daily power and energy generation forecasts, as well as annual and monthly aggregates.

## Architecture

The modeling system follows a **four-layer pipeline**, where each layer processes data and passes it to the next:

### 1. Hydrology Layer (`lib/ngonyeFlow/`)

Processes raw gauge measurements into synthetic daily river flow series.

- **Input**: Daily gauge readings (water level in meters)
- **Processing**: 
  - Stage-discharge conversion using Sioma gauge relation: `flow = 1093.0355 × (level - 2.85)^1.659`
  - Water year calculation (October-September fiscal cycle)
  - Flow duration curve percentiles
- **Output**: `data/syntheticFlowSeries/{year}/processed/daily.csv`

### 2. Environmental Flows Layer (`lib/ngonyePlantModel/model/eFlowsModel.js`)

Determines the minimum river flows that must be maintained in each channel based on ecological requirements.

- **Input**: Daily flows, water year, assurance level settings
- **Lookup Data**: `data/ngonyePlantModels/lookups/eflows_*.csv`
- **Output**: Environmental flow requirements for channels A, C, D, E, FG and an aggregated total
- **Key Fields Added**:
  - `ewrFlowBand`: Environmental Water Requirement band (A, B, C...)
  - `ewrFlowBandNumber`: Numeric version of the band

### 3. Plant Operations Layer (`lib/ngonyePlantModel/model/`)

Core physics calculations for how the plant operates on a given day.

#### Flows Model (`flowsModel.js`)
- Splits total river flow into:
  - Environmental flows (by channel)
  - Generation flow (for power production)
  - Spill flows (environmental release through spillways)
- Respects canal capacity and minimum operating flow

#### Levels & Losses Model (`levelsAndLossesModel.js`)
- Calculates headpond (upstream) and tailwater (downstream) water levels
- Computes head losses through:
  - Turbine passages
  - Supply canal
  - Left channel spillway
  - Upstream approach

#### Power & Energy Model (`powerAndEnergyModel.js`)
- Applies turbine efficiency curves based on operating conditions
- Calculates power output (MW) and daily energy generation (MWh)
- Handles operational constraints (minimum/maximum head, generator limits)
- Supports multiple calculation methods (two scenarios per day)

### 4. Statistics & Output Layer (`lib/ngonyePlantModel/model/statistics.js`)

Aggregates daily results into 500+ performance metrics.

- **Daily Outputs**: Full details for each day
- **Monthly/Annual Aggregates**: Mean, median, percentiles, total energy
- **Exceedance Curves**: Probability distributions of generation capacity

## Getting Started

### Prerequisites

- Node.js 16+ (uses ES modules)
- npm

### Installation

```bash
git clone <repository-url>
cd ngonye-models
npm install
```

### Directory Structure

```
ngonye-models/
├── lib/                                  # Model code
│   ├── library.js                        # Shared utilities
│   ├── ngonyeFlow/                       # Hydrology layer
│   │   └── syntheticFlowSeries.js        # Flow series builder
│   └── ngonyePlantModel/                 # Plant simulation layers
│       ├── modelRunner.js                # Standard model orchestrator
│       ├── cciaRunner.js                 # Climate change runner
│       ├── cciaSetup.js                  # Climate flow annotation
│       ├── cciaScenariosRunner.js        # Sensitivity analysis runner
│       └── model/                        # Core physics models
│           ├── eFlowsModel.js
│           ├── flowsModel.js
│           ├── levelsAndLossesModel.js
│           ├── powerAndEnergyModel.js
│           ├── plantModel.js             # Main orchestrator
│           └── statistics.js
├── data/
│   ├── gaugeData/                        # Raw gauge measurements (CSV)
│   ├── syntheticFlowSeries/              # Processed daily flows
│   │   └── {year}/processed/daily.csv
│   └── ngonyePlantModels/
│       ├── modelParameters.js            # Scenario definitions
│       ├── cciaModelParameters.js        # Climate scenario definitions
│       ├── lookups/                      # Reference tables (CSV)
│       │   ├── hillchart_*.csv           # Turbine efficiency curves
│       │   ├── eflows_*.csv              # Environmental flow rules
│       │   ├── generator_efficiency.csv  # Generator performance
│       │   └── ... other lookups
│       ├── models/                       # Model run outputs
│       │   └── {modelRef}/daily.csv
│       └── ccia/                         # Climate change outputs
│           ├── cciaModels_*.csv          # Summary statistics
│           ├── flowModels/               # Annotated flow inputs
│           └── plantModels/              # Detailed results
├── scripts/
│   ├── runner.sh                         # Standard model watcher
│   └── cciaRunner.sh                     # Climate model watcher
└── README.md (this file)
```

## Running Models

### Standard Model Runs

Standard runs evaluate the base case and parameter variations using historic hydrology data.

```bash
cd scripts
./runner.sh
```

This command:
1. Watches for changes to model code and configuration files
2. For each scenario defined in `modelParameters.js`:
   - Loads historic daily flows
   - Runs the plant model pipeline
   - Outputs daily and aggregated statistics
3. Writes results to:
   - `data/ngonyePlantModels/models/{modelRef}/daily.csv`
   - `data/ngonyePlantModels/models/modelStatistics.csv` (summary)

To run a single iteration without watching:
```bash
cd scripts
node ../lib/ngonyePlantModel/modelRunner.js
```

### Adding a New Scenario

1. Edit `data/ngonyePlantModels/modelParameters.js`
2. Add an entry to the `models[]` array:
```javascript
{
  modelRef: 'my_scenario',
  modelName: 'My Custom Scenario',
  description: 'Description of the scenario',
  minimumHead: 8.5,          // Override base parameters as needed
  ratedFlowUnit: 250,
  hydrologySet: '2024'       // Use 2016 or 2024 historic data
}
```
3. Run the model runner - it will detect the new scenario and execute it

### Climate Change Impact Assessment (CCIA)

CCIA runs assess how climate change scenarios affect hydropower generation.

#### Stage 1: Setup & Flow Annotation

This stage processes raw climate model flow projections into the format expected by the plant model.

```bash
cd lib/ngonyePlantModel
node cciaSetup.js
```

What it does:
- Loads climate flow projections from `data/ngonyePlantModels/ccia/Ngonye_CC_flows_combined.csv`
- For each climate scenario:
  - Calculates water years
  - Computes flow duration curve percentiles
  - Applies environmental flow rules
- Outputs to `data/ngonyePlantModels/ccia/flowModels/{hydrologySet}/{modelName}.csv`

#### Stage 2: Run Plant Model Against Climate Flows

Two options depending on your analysis goals:

**Option A: Single plant model, all climate scenarios**

```bash
cd scripts
./cciaRunner.sh
```

- Uses fixed plant model (default: `base_sh`)
- Runs all climate scenarios
- Compares each to historic baseline
- Outputs variance metrics (`meanVar`, `P50Var`)
- Results: `data/ngonyePlantModels/ccia/cciaModels_{hydrologySet}.csv`

To change which plant model is used, edit `cciaRunner.js`:
```javascript
const plantModelRef = 'base_sh'  // Change this line
```

**Option B: Multiple plant models, specific climate scenario**

```bash
cd lib/ngonyePlantModel
node cciaScenariosRunner.js
```

- Runs multiple plant models against a single climate scenario
- Useful for parameter sensitivity studies
- Configure in `cciaScenariosRunner.js`:
```javascript
const cciaFlowSSPRef = 'ssp5'           // SSP scenario
const cciaForecastPeriod = '2050'       // 2050 or 2085
const cciaFlowModelRef = 'UKESM1-0-LL'  // Specific climate model
```
- Plant models: Defined in `cciaModelParameters.js`

## Project Structure

### Key Files

| File | Purpose |
|------|---------|
| `lib/ngonyePlantModel/modelRunner.js` | Main orchestrator for standard runs |
| `lib/ngonyePlantModel/model/plantModel.js` | Daily model calculations coordinator |
| `data/ngonyePlantModels/modelParameters.js` | Scenario definitions (base and variants) |
| `lib/library.js` | Shared utilities (interpolation, moving averages) |
| `data/syntheticFlowSeries/{year}/processed/daily.csv` | Input: Daily flows with annotations |
| `data/ngonyePlantModels/models/modelStatistics.csv` | Output: Summary statistics by scenario |

### Data Files

| Location | Contents |
|----------|----------|
| `data/gaugeData/` | Raw gauge measurements (CSV) |
| `data/ngonyePlantModels/lookups/` | Reference tables for interpolation |
| `data/ngonyePlantModels/models/` | Model run outputs |
| `data/ngonyePlantModels/ccia/` | Climate change data and outputs |

## Key Concepts

### Daily Record Structure

Each day flows through the pipeline as a JavaScript object that accumulates annotations:

```javascript
{
  // Input data
  date: '2024-01-01T00:00:00.000Z',
  datetime: DateTime,                    // Luxon DateTime object
  flow: 1500,                            // River flow in m³/s
  waterYear: 2024,                       // October-September fiscal year
  waterMonth: 1,
  FDCPercentile: 65,                     // Position on flow duration curve
  
  // Environmental requirements (added by eFlowsModel)
  ewrFlowBand: 'B',                      // Environmental band level
  ewrFlowBandNumber: 2,
  
  // Flow allocations (added by flowsModel)
  flows: {
    eFlows: { 
      channelA: 50, channelC: 30, channelD: 20, channelE: 15, 
      channelFG: 10, total: 125
    },
    canal: 500,                          // Flow through turbines
    spill: {
      channelA: 100, channelC: 80, ... // Flows released through spillways
    },
    channels: { /* channel flow totals */ }
  },
  
  // Water levels & losses (added by levelsAndLossesModel)
  levels: {
    headpond: 678.5,                     // Upstream water level (m ASL)
    tailwaterLevel: 651.2,               // Downstream water level
    grossHead: 27.3,                     // Total head (m)
    headlosses: {
      turbine: 0.8,
      canal: 1.2,
      leftchannel: 0.3
    }
  },
  
  // Power output (added by powerAndEnergyModel)
  generation: {
    units: 4,                            // Number of turbines running
    calc2: {
      power: 35.4,                       // MW
      energy: 850,                       // MWh (daily)
      efficiency: 0.88
    }
  }
}
```

### Model Parameters

Scenarios are created by combining base parameters with scenario-specific overrides:

```javascript
// Base parameters (shared by all models)
baseParams = {
  minimumHead: 10,
  maximumHead: 25.4,
  ratedFlowUnit: 220,
  plantCapacity: 180,
  // ... many more
}

// Scenario variants override base parameters
models = [
  { modelRef: 'base_sh', /* inherits all baseParams */ },
  { 
    modelRef: 'low_head',
    minimumHead: 7.8,  // Override just this parameter
    // Other parameters inherited from baseParams
  }
]
```

### Water Year

The project uses a **water year** (October-September) rather than calendar year. This is hydrologically relevant since:
- October is typically the start of dry season streamflow
- September is the end of wet season runoff

Water year 2024 means: October 2023 - September 2024

### Flow Duration Curve (FDC)

The FDC percentile indicates where a day's flow ranks in historical distribution:
- **FDCPercentile = 90**: Flow exceeded 90% of the time (very low flow, 10th percentile)
- **FDCPercentile = 50**: Median flow
- **FDCPercentile = 10**: Flow exceeded only 10% of the time (very high flow, 90th percentile)

## Common Tasks

### Modify Turbine Efficiency

Edit the efficiency lookup tables in `data/ngonyePlantModels/lookups/`:
- `hillchart_sh.csv` - Sinohydro design
- `hillchart_fs.csv` - Alternative design
- `generator_efficiency.csv` - Generator performance curve

Then re-run models for results to reflect the change.

### Adjust Environmental Flow Rules

Edit environmental flow requirements in `data/ngonyePlantModels/lookups/`:
- `eflows_assurance_sets.csv` - Assurance level definitions
- `eflows_channel_flows.csv` - Required flows per channel and month

### Add a New Output Metric

1. Edit `lib/ngonyePlantModel/model/statistics.js`
2. Add calculation to the daily or aggregated statistics functions
3. Include in CSV output via `d3.csvFormat()`

### Change Base Hydrology Period

Scenarios reference a `hydrologySet` (e.g., '2016' or '2024'). To use different historic periods:
1. Ensure daily flows are processed: `lib/ngonyeFlow/syntheticFlowSeries.js`
2. Update `hydrologySet` in scenario definitions
3. Re-run models

## Important Notes

### Water Year Boundary
The code carefully handles the October-September boundary. The `waterYear` field is calculated as:
- Months Oct-Dec: waterYear = current calendar year
- Months Jan-Sep: waterYear = previous calendar year

This ensures continuous water-year numbering.

### DateTime Handling
- All internal datetime calculations use **midnight UTC** (00:00:00)
- The model runner checks and corrects any datetime inconsistencies
- CSV input/output uses ISO date format

### Spill Validation
The code validates that spill flows are never negative, which would indicate a flow conservation error. If you see "Spill is negative" errors, check:
- Environmental flow calculations
- Canal flow constraints
- Flow splitting logic in `flowsModel.js`

### Generator Constraints
Multiple flags affect power calculation. Review these in `powerAndEnergyModel.js` if output unexpectedly changes:
- `constrainFinalGeneratorOutput` - Limit to max generator capacity
- `maximumHeadShutdown` - Stop generation above maximum head
- Efficiency curve interpolation for off-nominal conditions

### CSV Type Inference
The code uses `d3.autoType` to automatically infer column types from CSV files. Watch for:
- Channel identifiers that might parse as numbers instead of strings
- Boolean values being converted unexpectedly
- If lookups aren't working, check column types in the CSV

## Dependencies

- **d3** (v7.9.0) - Data parsing, transformation, interpolation
- **d3-array** (v3.2.4) - Array utilities
- **luxon** (v3.5.0) - Date/time calculations
- **node**: ES modules with `"type": "module"` in package.json

## License

ISC

## Support

For issues, questions, or contributions, please contact the project maintainers.
