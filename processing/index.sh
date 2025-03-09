
nodemon --watch ./processing/data/input_gauge_data --watch ./processing/models/a_synthetic_flow_series.js --watch -e js,csv ./processing/models/a_synthetic_flow_series.js &

nodemon --watch ./processing/data/synthetic_flow_series --watch ./processing/models/flowStatistics.js --watch ./processing/models/b_flow_statistics.js  --watch -e js,csv ./processing/models/b_flow_statistics.js &
