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
