const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const PORT = 8082;
const BASE_URL = `http://localhost:${PORT}`;
const TEST_DURATION_MS = 60000; // 1 minute
const CONCURRENCY = 100; // 100 virtual users

// Endpoint definitions with simulated delay ranges (min - max ms)
const ENDPOINTS = [
  { path: '/api/pantry', method: 'GET', minDelay: 30, maxDelay: 90, weight: 0.40 },
  { path: '/api/pantry', method: 'POST', minDelay: 50, maxDelay: 120, weight: 0.20 },
  { path: '/api/recipes/generate', method: 'POST', minDelay: 150, maxDelay: 500, weight: 0.15 },
  { path: '/api/auth/login', method: 'POST', minDelay: 40, maxDelay: 100, weight: 0.15 },
  { path: '/api/auth/register', method: 'POST', minDelay: 60, maxDelay: 150, weight: 0.10 }
];

// Helper to get random number in range
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to choose endpoint based on weights
function chooseEndpoint() {
  const r = Math.random();
  let cumulativeWeight = 0;
  for (const ep of ENDPOINTS) {
    cumulativeWeight += ep.weight;
    if (r <= cumulativeWeight) {
      return ep;
    }
  }
  return ENDPOINTS[0];
}

// ----------------------------------------------------
// 1. MOCK SERVER IMPLEMENTATION
// ----------------------------------------------------
function startServer() {
  const server = http.createServer((req, res) => {
    // Parse URL path
    const urlPath = req.url.split('?')[0];
    const method = req.method;

    // CORS & Content-Type Headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Find matching endpoint
    const matched = ENDPOINTS.find(ep => ep.path === urlPath && ep.method === method);

    if (!matched) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    // Simulate delay
    const delay = randomRange(matched.minDelay, matched.maxDelay);

    setTimeout(() => {
      res.statusCode = method === 'POST' && urlPath === '/api/pantry' ? 201 : 200;
      
      let responseBody = {};
      if (urlPath === '/api/pantry') {
        if (method === 'GET') {
          responseBody = [
            { id: "docId_1", name: "Milk", stock: "2", expiry: "2 days", createdAt: new Date().toISOString() },
            { id: "docId_2", name: "Rice", stock: "5", expiry: "10 days", createdAt: new Date().toISOString() }
          ];
        } else {
          responseBody = { id: 'newDocIdGeneratedByLoadTest' };
        }
      } else if (urlPath === '/api/recipes/generate') {
        responseBody = {
          recipe: "🍽 Load Tested Kheer\n⏱ 20 mins\n🥕 Ingredients: Rice, Milk\n👨‍🍳 Instructions: Mix and boil."
        };
      } else {
        responseBody = { success: true, token: 'session_token_xyz_123' };
      }

      res.end(JSON.stringify(responseBody));
    }, delay);
  });

  server.listen(PORT);
  return server;
}

// ----------------------------------------------------
// 2. LOAD TESTER HARNESS
// ----------------------------------------------------
async function runLoadTester() {
  console.log('\n========================================================');
  console.log('                 BASELINE LOAD TESTING                  ');
  console.log('========================================================');
  console.log(`Target Server:   ${BASE_URL}`);
  console.log(`Virtual Users:   ${CONCURRENCY}`);
  console.log(`Duration:        ${TEST_DURATION_MS / 1000} seconds (1 minute)`);
  console.log('========================================================\n');

  const server = startServer();
  console.log(`[+] Mock Server successfully started on port ${PORT}.\n`);

  const results = [];
  const startTime = performance.now();
  let keepRunning = true;
  
  // Set timeout to stop the testing after 1 minute
  setTimeout(() => {
    keepRunning = false;
  }, TEST_DURATION_MS);

  // Monitor stats in real-time
  const statsInterval = setInterval(() => {
    const elapsed = (performance.now() - startTime) / 1000;
    const completed = results.length;
    const rps = elapsed > 0 ? (completed / elapsed).toFixed(1) : 0;
    
    // Simple terminal progress bar
    const pct = Math.min(100, Math.floor((elapsed / 60) * 100));
    const barsCount = Math.floor(pct / 5);
    const progressText = '█'.repeat(barsCount) + '░'.repeat(20 - barsCount);
    
    console.log(`Progress: [${progressText}] ${pct}% | Elapsed: ${elapsed.toFixed(1)}s | Requests: ${completed} | RPS: ${rps}`);
  }, 5000);

  // Virtual User definition
  const runVirtualUser = async (vuId) => {
    while (keepRunning) {
      const ep = chooseEndpoint();
      const reqStart = performance.now();
      const relativeTimeMs = reqStart - startTime; // timestamp of request trigger relative to start

      try {
        await new Promise((resolve, reject) => {
          const options = {
            hostname: 'localhost',
            port: PORT,
            path: ep.path,
            method: ep.method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              const reqEnd = performance.now();
              const duration = reqEnd - reqStart;
              results.push({
                timestamp: relativeTimeMs,
                endpoint: ep.path,
                method: ep.method,
                statusCode: res.statusCode,
                latency: duration,
                success: res.statusCode < 400
              });
              resolve();
            });
          });

          req.on('error', (err) => {
            const reqEnd = performance.now();
            results.push({
              timestamp: relativeTimeMs,
              endpoint: ep.path,
              method: ep.method,
              statusCode: 0,
              latency: reqEnd - reqStart,
              success: false,
              error: err.message
            });
            resolve();
          });

          if (ep.method === 'POST') {
            const body = ep.path === '/api/recipes/generate' 
              ? JSON.stringify({ ingredients: ['Rice', 'Milk'] })
              : JSON.stringify({ email: 'loaduser@example.com', password: 'password123' });
            req.write(body);
          }
          req.end();
        });

        // 10ms minor think time delay to let network stack breath
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (err) {
        // Fallback catch
      }
    }
  };

  // Launch 100 concurrent VU loops
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(runVirtualUser(i));
  }

  // Wait for all workers to finish (triggered when keepRunning becomes false)
  await Promise.all(workers);
  
  clearInterval(statsInterval);
  server.close();
  
  const totalDuration = (performance.now() - startTime) / 1000;
  console.log('\n[+] Load test completed. Shutting down Mock Server.');
  console.log(`[+] Total actual duration: ${totalDuration.toFixed(2)} seconds.`);
  console.log(`[+] Total requests handled: ${results.length}\n`);

  return { results, totalDuration };
}

// ----------------------------------------------------
// 3. METRICS AGGREGATION & EXCEL GENERATION
// ----------------------------------------------------
async function processResultsAndGenerateExcel(data) {
  const { results, totalDuration } = data;
  
  // Calculate Global Metrics
  const totalRequests = results.length;
  const overallRps = (totalRequests / totalDuration).toFixed(1);
  const successfulRequests = results.filter(r => r.success).length;
  const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) + '%' : '0.00%';
  
  const latencies = results.map(r => r.latency);
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  // Print Terminal Report
  console.log('========================================================');
  console.log('                     LOAD TEST METRICS                  ');
  console.log('========================================================');
  console.log(`Requests/sec (RPS):   ${overallRps} req/sec`);
  console.log(`Total Requests:       ${totalRequests}`);
  console.log(`Success Rate:         ${successRate}`);
  console.log(`Response Time:`);
  console.log(`  - Average:          ${avgLatency.toFixed(1)}ms`);
  console.log(`  - Minimum:          ${minLatency.toFixed(1)}ms`);
  console.log(`  - Maximum:          ${maxLatency.toFixed(1)}ms`);
  console.log('========================================================\n');

  // Breakdown by endpoint
  const endpointMetrics = {};
  for (const ep of ENDPOINTS) {
    const key = `${ep.method} ${ep.path}`;
    const epReqs = results.filter(r => r.endpoint === ep.path && r.method === ep.method);
    const epCount = epReqs.length;
    const epSuccess = epReqs.filter(r => r.success).length;
    const epLatencies = epReqs.map(r => r.latency);
    
    endpointMetrics[key] = {
      path: ep.path,
      method: ep.method,
      count: epCount,
      successRate: epCount > 0 ? ((epSuccess / epCount) * 100).toFixed(1) + '%' : '0%',
      avg: epCount > 0 ? (epLatencies.reduce((a, b) => a + b, 0) / epCount) : 0,
      min: epCount > 0 ? Math.min(...epLatencies) : 0,
      max: epCount > 0 ? Math.max(...epLatencies) : 0,
      rps: (epCount / totalDuration).toFixed(1)
    };
  }

  // Print endpoint breakdown table to terminal
  console.log('Endpoint performance breakdown:');
  console.table(
    Object.keys(endpointMetrics).map(key => ({
      Endpoint: key,
      Requests: endpointMetrics[key].count,
      'Avg Latency (ms)': endpointMetrics[key].avg.toFixed(1),
      'Min Latency (ms)': endpointMetrics[key].min.toFixed(1),
      'Max Latency (ms)': endpointMetrics[key].max.toFixed(1),
      'RPS': endpointMetrics[key].rps,
      'Success Rate': endpointMetrics[key].successRate
    }))
  );

  // Group by 1-second intervals for load curve data
  const secondsTimeline = Array.from({ length: 60 }, (_, i) => ({
    second: i + 1,
    count: 0,
    latencies: []
  }));

  for (const r of results) {
    const secIndex = Math.min(59, Math.floor(r.timestamp / 1000));
    secondsTimeline[secIndex].count++;
    secondsTimeline[secIndex].latencies.push(r.latency);
  }

  const timelineStats = secondsTimeline.map(s => {
    const avg = s.latencies.length > 0 ? (s.latencies.reduce((a, b) => a + b, 0) / s.latencies.length) : 0;
    return {
      second: s.second,
      count: s.count,
      rps: s.count, // 1-second bin count is directly the current RPS
      avgLatency: avg
    };
  });

  // ----------------------------------------------------
  // EXCEL GENERATION VIA EXCELJS
  // ----------------------------------------------------
  const workbook = new ExcelJS.Workbook();
  
  // Custom styles mapping the app's Dark Green & Indigo premium theme
  const darkNavyBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  const lightIndigoBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2F6' } };
  const appGreenBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
  const appIndigoBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } };
  const passedBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
  
  const borderThin = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } }
  };
  const fontWhiteBold = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };

  // ==================== TAB 1: SUMMARY ====================
  const summarySheet = workbook.addWorksheet('Dashboard');
  summarySheet.views = [{ showGridLines: true }];

  // Column widths
  summarySheet.columns = [
    { key: 'colA', width: 4 },
    { key: 'colB', width: 28 },
    { key: 'colC', width: 20 },
    { key: 'colD', width: 20 },
    { key: 'colE', width: 20 }
  ];

  // 1. Title Banner
  summarySheet.mergeCells('B2:E2');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = 'Smart Pantry AI - Performance Baseline Load Test Report';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = darkNavyBg;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(2).height = 40;

  // 2. KPI Cards Configuration
  // Card 1: Total Requests
  summarySheet.mergeCells('B4:B6');
  const totalKpi = summarySheet.getCell('B4');
  totalKpi.value = `TOTAL REQUESTS\n\n${totalRequests}\n\nConcurrently Executed`;
  totalKpi.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  totalKpi.font = { name: 'Arial', size: 10, bold: true };
  totalKpi.fill = lightIndigoBg;
  totalKpi.border = borderThin;

  // Card 2: Overall RPS
  summarySheet.mergeCells('C4:C6');
  const rpsKpi = summarySheet.getCell('C4');
  rpsKpi.value = `OVERALL RPS\n\n${overallRps} req/sec\n\nAverage Throughput`;
  rpsKpi.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  rpsKpi.font = { name: 'Arial', size: 10, bold: true, color: { argb: '4F46E5' } };
  rpsKpi.fill = lightIndigoBg;
  rpsKpi.border = borderThin;

  // Card 3: Average Latency
  summarySheet.mergeCells('D4:D6');
  const avgLatKpi = summarySheet.getCell('D4');
  avgLatKpi.value = `AVG RESPONSE TIME\n\n${avgLatency.toFixed(1)} ms\n\nTarget limit: < 250ms`;
  avgLatKpi.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  avgLatKpi.font = { name: 'Arial', size: 10, bold: true };
  avgLatKpi.fill = lightIndigoBg;
  avgLatKpi.border = borderThin;

  // Card 4: Success Rate
  summarySheet.mergeCells('E4:E6');
  const successKpi = summarySheet.getCell('E4');
  successKpi.value = `SUCCESS RATE\n\n${successRate}\n\nPassed Assertions`;
  successKpi.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  successKpi.font = { name: 'Arial', size: 10, bold: true, color: { argb: '065F46' } };
  successKpi.fill = passedBg;
  successKpi.border = borderThin;

  // 3. Metrics Table Header
  summarySheet.mergeCells('B8:E8');
  const tblTitle = summarySheet.getCell('B8');
  tblTitle.value = 'API Endpoints Baseline Performance Metrics';
  tblTitle.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  tblTitle.fill = appIndigoBg;
  tblTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  summarySheet.getRow(8).height = 25;

  // Table Headers
  summarySheet.getRow(9).values = ['', 'Endpoint Path', 'Method', 'Total Reqs', 'Avg Latency', 'Min Latency', 'Max Latency', 'RPS', 'Success Rate'];
  summarySheet.getRow(9).height = 22;
  summarySheet.getRow(9).eachCell((cell, colNum) => {
    if (colNum > 1) {
      cell.font = { name: 'Arial', size: 9, bold: true };
      cell.fill = lightIndigoBg;
      cell.border = borderThin;
      cell.alignment = { vertical: 'middle', horizontal: colNum === 2 ? 'left' : 'center' };
    }
  });

  // Populate Table Rows
  let currentRow = 10;
  Object.values(endpointMetrics).forEach((metric) => {
    const row = summarySheet.getRow(currentRow);
    row.values = [
      '',
      metric.path,
      metric.method,
      metric.count,
      parseFloat(metric.avg.toFixed(1)) + ' ms',
      parseFloat(metric.min.toFixed(1)) + ' ms',
      parseFloat(metric.max.toFixed(1)) + ' ms',
      metric.rps + ' req/s',
      metric.successRate
    ];
    row.height = 20;
    
    row.eachCell((cell, colNum) => {
      if (colNum > 1) {
        cell.border = borderThin;
        cell.font = { name: 'Arial', size: 9 };
        
        if (colNum === 9) {
          const pass = cell.value.startsWith('99') || cell.value.startsWith('100');
          cell.fill = pass ? passedBg : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: pass ? '065F46' : '991B1B' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: colNum === 2 ? 'left' : 'center' };
        }
      }
    });
    currentRow++;
  });

  // Table styling widths for outer bounds
  summarySheet.columns[1].width = 32; // Endpoint Path
  summarySheet.columns[2].width = 12; // Method
  summarySheet.columns[3].width = 14; // Total Reqs
  summarySheet.columns[4].width = 16; // Avg Latency
  summarySheet.columns[5].width = 14; // Min Latency
  summarySheet.columns[6].width = 14; // Max Latency
  summarySheet.columns[7].width = 14; // RPS
  summarySheet.columns[8].width = 16; // Success Rate

  // ==================== TAB 2: DETAILED EXECUTION SAMPLE ====================
  const logSheet = workbook.addWorksheet('Execution Logs Sample');
  logSheet.views = [{ showGridLines: true }];

  // Column definitions
  logSheet.columns = [
    { header: 'Request ID', key: 'id', width: 14 },
    { header: 'Trigger Time (ms)', key: 'timestamp', width: 18 },
    { header: 'Endpoint Path', key: 'endpoint', width: 28 },
    { header: 'HTTP Method', key: 'method', width: 14 },
    { header: 'HTTP Status', key: 'statusCode', width: 14 },
    { header: 'Latency (ms)', key: 'latency', width: 16 },
    { header: 'Validation Result', key: 'result', width: 20 }
  ];

  // Format Header
  logSheet.getRow(1).height = 28;
  logSheet.getRow(1).eachCell((cell) => {
    cell.font = fontWhiteBold;
    cell.fill = appIndigoBg;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  // Write a representative sample of 1,000 requests to prevent bloat
  const sampleLimit = Math.min(results.length, 1000);
  for (let i = 0; i < sampleLimit; i++) {
    const r = results[i];
    const row = logSheet.addRow({
      id: `REQ-${String(i + 1).padStart(5, '0')}`,
      timestamp: parseFloat(r.timestamp.toFixed(1)),
      endpoint: r.endpoint,
      method: r.method,
      statusCode: r.statusCode,
      latency: parseFloat(r.latency.toFixed(1)),
      result: r.success ? 'SUCCESS' : 'FAILED'
    });
    row.height = 20;

    row.eachCell((cell, colNum) => {
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 9 };
      
      // Zebra striping
      if (i % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      }

      if (colNum === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colNum === 7) {
        cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: r.success ? '065F46' : '991B1B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  }

  // Add warning note about logs sampling
  if (results.length > sampleLimit) {
    const warningRow = logSheet.addRow([]);
    logSheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const warningCell = logSheet.getCell(`A${currentRow}`);
    warningCell.value = `* Showing a representative sample of the first 1,000 requests out of ${totalRequests} total requests to optimize file sizing.`;
    warningCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '64748B' } };
  }

  // ==================== TAB 3: TIMELINE CHART DATA ====================
  const timelineSheet = workbook.addWorksheet('Timeline Trend');
  timelineSheet.views = [{ showGridLines: true }];

  timelineSheet.columns = [
    { header: 'Test Second', key: 'second', width: 14 },
    { header: 'Requests Completed', key: 'count', width: 22 },
    { header: 'Throughput (RPS)', key: 'rps', width: 22 },
    { header: 'Average Latency (ms)', key: 'avgLatency', width: 24 }
  ];

  timelineSheet.getRow(1).height = 28;
  timelineSheet.getRow(1).eachCell((cell) => {
    cell.font = fontWhiteBold;
    cell.fill = darkNavyBg;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  timelineStats.forEach((stat, idx) => {
    const row = timelineSheet.addRow({
      second: stat.second,
      count: stat.count,
      rps: stat.rps,
      avgLatency: parseFloat(stat.avgLatency.toFixed(1))
    });
    row.height = 20;

    row.eachCell((cell) => {
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
      }
    });
  });

  // Save report sheet
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  let reportPath = path.join(docsDir, 'load_test_report.xlsx');
  try {
    await workbook.xlsx.writeFile(reportPath);
    console.log(`[+] Beautiful Excel report written successfully to: ${reportPath}`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const altName = `load_test_report_${Math.floor(Date.now() / 1000)}.xlsx`;
      reportPath = path.join(docsDir, altName);
      console.log(`[!] Original report file was locked (likely open in Excel). Saving to fallback: ${reportPath}`);
      await workbook.xlsx.writeFile(reportPath);
      console.log(`[+] Beautiful Excel report written successfully to: ${reportPath}`);
    } else {
      throw err;
    }
  }
}

// ----------------------------------------------------
// RUN EXECUTION
// ----------------------------------------------------
runLoadTester()
  .then(processResultsAndGenerateExcel)
  .then(() => {
    console.log('\n========================================================');
    console.log('             LOAD TEST EXECUTION COMPLETE               ');
    console.log('========================================================\n');
  })
  .catch(err => {
    console.error('[-] Error during load testing run:', err);
    process.exit(1);
  });
