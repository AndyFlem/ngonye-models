nodemon --verbose \
    --watch plantModel.js \
    --watch powerAndEnergy.js \
    --watch flowsModel.js \
    --watch levelsAndLossesModel.js \
    --watch eFlowsModel.js \
    --watch ../../data/ngonyePlantModels/modelParameters.js \
    --watch -e js,csv \
    plantModel.js &

