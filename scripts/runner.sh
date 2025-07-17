nodemon --verbose \
    --watch ../lib/ngonyePlantModel/modelRunner.js \
    --watch ../lib/ngonyePlantModel/model/plantModel.js \
    --watch ../lib/ngonyePlantModel/model/powerAndEnergyModel.js \
    --watch ../lib/ngonyePlantModel/model/flowsModel.js \
    --watch ../lib/ngonyePlantModel/model/levelsAndLossesModel.js \
    --watch ../lib/ngonyePlantModel/model/eFlowsModel.js \
    --watch ../lib/ngonyePlantModel/model/statistics.js \
    --watch ../data/ngonyePlantModels/modelParameters.js \
    --watch -e js,csv \
    ../lib/ngonyePlantModel/modelRunner.js &

``