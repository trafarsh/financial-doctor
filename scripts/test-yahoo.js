async function test() {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/^NSEI?interval=1d&range=1d");
    const json = await res.json();
    console.log("NIFTY 50 Metadata:", JSON.stringify(json.chart.result[0].meta, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
