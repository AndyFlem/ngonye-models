nodemon --verbose \
    --watch plantModel.js \
    --watch powerAndEnergyModel.js \
    --watch flowsModel.js \
    --watch levelsAndLossesModel.js \
    --watch eFlowsModel.js \
    --watch statistics.js \
    --watch ../../data/ngonyePlantModels/modelParameters.js \
    --watch -e js,csv \
    plantModel.js &

