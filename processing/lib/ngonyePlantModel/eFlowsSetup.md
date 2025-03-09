# Setup Environmental Flow Requirements Data

Calculated Environmental Flow exceedance percentiles for each day of the historic flow series. These are used later to determine environmental flows.

## Procedure

From: **Mott MacDonald** - *Ngonye Falls Hydropower Project - 2018 Feasibility Study Update - Final Report Version D*

Based on the environmental flow bands, the methodology adopted for the energy modelling is as below:

- The flow on the 8th, 18th and 28th day of each month is identified. 
- The equivalent percentile of this flow based on flow exceedance curves is calculated for that day from the 92 years of data.
- This percentile is used to decide the environmental flow release for the succeeding ~10 day periods of 1st to 10th, 11th to 20th and 21st to end of the month.
- Environmental flow in this band and month is released in the respective channels.

In this notebook the exceedance percentiles for each day of the historic flow series are calculated. These will later be used to lookup the required EWR values for each channel depending on the Environmental Assurance Category selected for the channel. 