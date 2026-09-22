import autocannon from "autocannon";

const instance = autocannon(
  {
    url: "http://localhost:3000",

    connections: 100,
    duration: 30,

    requests: [
      {
        method: "GET",
        path: "/gateway/users/1",
      },
    ],
  },
  (error, result) => {
    if (error) {
      console.error("Load test failed:", error);
      process.exit(1);
    }

    console.log("\nHot-cache load test completed.\n");

    console.log("Requests:");
    console.log(`Total:      ${result.requests.total}`);
    console.log(`Throughput: ${result.requests.average} req/sec`);

    console.log("\nLatency:");
    console.log(`Average: ${result.latency.average} ms`);
    console.log(`P50:     ${result.latency.p50} ms`);
    console.log(`P90:     ${result.latency.p90} ms`);
    console.log(`P97.5:   ${result.latency.p97_5} ms`);
    console.log(`P99:     ${result.latency.p99} ms`);
    console.log(`P99.9:   ${result.latency.p99_9} ms`);
    console.log(`Max:     ${result.latency.max} ms`);

    console.log("\nErrors:");
    console.log(`Non-2xx:  ${result.non2xx}`);
    console.log(`Errors:   ${result.errors}`);
    console.log(`Timeouts: ${result.timeouts}`);

    console.log("\nStatus codes:");
    console.log(result.statusCodeStats);
  }
);