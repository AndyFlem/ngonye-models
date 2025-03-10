import * as d3 from 'd3'
export function movingAverage(values, N) {
  let i = 0
  let sum = 0
  const means = new Float64Array(values.length).fill(NaN)
  for (let n = Math.min(N - 1, values.length); i < n; ++i) {
    sum += values[i]
  }
  for (let n = values.length; i < n; ++i) {
    sum += values[i]
    means[i - Math.floor(N / 2)] = sum / N
    sum -= values[i - N + 1]
  }
  return means
}


export function movingAverage2(values, N) {
  return values.map((v,i)=> {
    const from = Math.max(0, i-Math.floor(N/2))
    const to = Math.min(values.length, i+Math.floor(N/2)+1)
    return d3.mean(values.slice(from,to))
  })
}


export function interpolate(data, xs, ys , x) {
  
  const sorted = data.toSorted((a, b) => a[xs] - b[xs])
  const indx = d3.bisectLeft(sorted.map(v=>v[xs]), x)
  if (indx==0 || x==sorted[indx][xs]) return sorted[indx][ys]
  
  const a=sorted[indx-1]
  const b=sorted[indx]
  
  return a[ys] + ((b[ys] - a[ys])/(b[xs]-a[xs])*(x-a[xs]))
}

export function interpolate2d(ZValues, X, Y) {

	//Z Values Range
	var X0Y0 = 0;
	var X0Y1 =0;
	var X1Y0 =0;
	var X1Y1 =0;

	//X and Y Ranges
	var X0 =0;
	var X1=0;
	var Y0=0;
	var Y1=0;

	//Indexes
	var X0i =0;
	var X1i =0;
	var Y0i =0;
	var Y1i =0;
	var Xmax = ZValues.length;
	var Ymax = ZValues[0].length;

	//Result
	var result = {result: 0, error: ""};

	//Interpolated values
	let XMY0 = 0; //Interpolated Z from X at  Y0
	let XMY1 = 0; //Interpolated Z from X at Y1
	let XMYM = 0; //Interpolated Z from X and Y (result)

	//Check the boundary 
	if(X>ZValues[Xmax-1][0] || X<ZValues[1][0] || Y<ZValues[0][1] || Y>ZValues[0][Ymax-1]) { throw new Error(`Interpolation error: Input out of range: ${X} ${Y}.`)}

	else {
		//Load the table data into the variables
		for (var i=1; i<Xmax-1;i++) {
			
			if(ZValues[i][0] == X) X0i = i;
			else if(ZValues[i+1][0] == X) X1i = i+1;
			if(X>= ZValues[i][0] && X<= ZValues[i+1][0]) {
				X0i = i;
				X1i = i+1;
			}
		}

		for (var i=1; i<=Ymax-1;i++){
			
			if(ZValues[0][i] == Y) Y0i = i;
			else if(ZValues[0][i+1] == Y) Y1i = i+1;
			else if(Y>= ZValues[0][i] && Y<= ZValues[0][i+1]) {
				Y0i = i;
				Y1i = i+1;
			}		
		}
		

		X0 = ZValues[X0i][0];
		X1 = ZValues[X1i][0];
		Y0 = ZValues[0][Y0i];
		Y1 = ZValues[0][Y1i];
		X0Y0 = ZValues[X0i][Y0i];
		X0Y1 = ZValues[X0i][Y1i];
		X1Y0 = ZValues[X1i][Y0i];
		X1Y1 = ZValues[X1i][Y1i];
		
		//Performs the calculations
		if((X==X0 || X==X1)&&(Y==Y0 || Y==Y1))
		result.error = "Exact match. No interpolation needed.";
		else result.error = "Interpolated result.";

		//X is on the lower edge, no interpolation needed
		if(X==X0) {
			XMY0 = X0Y0; 
			XMY1 = X0Y1;
		}
		//X is on the higher edge, no interpolation needed
		else if(X==X1) {
			XMY0 = X1Y0;
			XMY1 = X1Y1;
		}
		//X is between the higher and lower edges, interpolation needed
		else {
			XMY0 = X0Y0 + (X-X0)*(X1Y0-X0Y0)/(X1-X0);
			XMY1 = X0Y1 + (X-X0)*(X1Y1-X0Y1)/(X1-X0);
		}
		//Y is on the lower edge, no interpolation needed
		if(Y==Y0) {
			XMYM = XMY0;
		}
		//Y is on the higher edge, no interpolation needed
		else if(Y==Y1) {
			XMYM = XMY1; 
			
		}
		//Y is between the higher and lower edges, interpolation needed
		else {
			XMYM = XMY0 + (Y-Y0)*(XMY1-XMY0)/(Y1-Y0);
		}

		//Not valid data was found for the proper interpolation
		if(isNaN(XMYM)) 
		{
			result.error = "Interpolation error: No data found for those inputs.";
		}
		else result.result = XMYM;

	}

	return result;
}
