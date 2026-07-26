const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

const resultsHtmlDir = path.join(config.paths.testResults, 'HTML');
const localReportsDir = config.paths.reports;
const docsDir = path.join(__dirname, '../../docs');

[resultsHtmlDir, localReportsDir, docsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function generateHTMLReports(testResults, metadata) {
  logger.info('Starting HTML Report compilation...');

  const total = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testResults.filter(r => r.status === 'SKIPPED').length;
  const successRate = total > 0 ? (passed / total) * 100 : 0;
  const totalDuration = testResults.reduce((acc, r) => acc + (r.duration || 0), 0);

  // Compile module statistics
  const moduleSummary = {};
  testResults.forEach(r => {
    if (!moduleSummary[r.module]) {
      moduleSummary[r.module] = { name: r.module, total: 0, passed: 0, failed: 0, skipped: 0 };
    }
    const m = moduleSummary[r.module];
    m.total++;
    if (r.status === 'PASSED') m.passed++;
    else if (r.status === 'FAILED') m.failed++;
    else m.skipped++;
  });

  const modulesList = Object.values(moduleSummary).map(m => {
    m.rate = m.total > 0 ? (m.passed / m.total) * 100 : 0;
    return m;
  });

  const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Pantry - Live Selenium E2E Report</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Outfit and Inter -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3, .font-display {
      font-family: 'Outfit', sans-serif;
    }
    .glass {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #020617;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen relative selection:bg-indigo-500/30">
  <!-- Top glow decoration -->
  <div class="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-indigo-950/20 via-cyan-900/5 to-transparent pointer-events-none z-0"></div>

  <div class="max-w-[1600px] mx-auto p-6 relative z-10 space-y-6">
    <!-- Header -->
    <header class="glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-display">SELENIUM LIVE SUITE</span>
          <span class="text-xs text-slate-500 font-mono">BUILD #${metadata.buildNumber}</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
          Live E2E Verification Dashboard
        </h1>
        <p class="text-slate-400 text-sm mt-1">Target Application: <a href="${metadata.baseUrl}" target="_blank" class="text-indigo-400 underline hover:text-indigo-300 font-mono">${metadata.baseUrl}</a></p>
      </div>
      <div class="flex flex-wrap items-center gap-3 font-mono text-xs">
        <div class="bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span class="text-slate-500">COMMIT:</span> <span class="text-indigo-400 font-bold">${metadata.commit}</span>
        </div>
        <div class="bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span class="text-slate-500">BRANCH:</span> <span class="text-cyan-400 font-bold">${metadata.branch}</span>
        </div>
        <div class="bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span class="text-slate-500">DATE:</span> <span class="text-slate-300">${new Date(metadata.date).toLocaleDateString()}</span>
        </div>
      </div>
    </header>

    <!-- KPI Widgets Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total -->
      <div class="glass rounded-2xl p-6 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-300"></div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Scenarios</p>
        <h3 class="text-4xl font-extrabold mt-2 font-display">${total}</h3>
        <p class="text-[11px] text-slate-500 font-mono mt-1">Selenium Webdriver core</p>
      </div>
      <!-- Passed -->
      <div class="glass rounded-2xl p-6 relative overflow-hidden group border-emerald-500/20">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Passed Asserts</p>
        <h3 class="text-4xl font-extrabold mt-2 text-emerald-400 font-display">${passed}</h3>
        <p class="text-[11px] text-emerald-500 font-mono mt-1">${successRate.toFixed(2)}% Success rate</p>
      </div>
      <!-- Failed -->
      <div class="glass rounded-2xl p-6 relative overflow-hidden group border-rose-500/20">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all duration-300"></div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Failed Asserts</p>
        <h3 class="text-4xl font-extrabold mt-2 ${failed > 0 ? 'text-rose-400' : 'text-slate-400'} font-display">${failed}</h3>
        <p class="text-[11px] text-rose-500 font-mono mt-1">${failed} Failures captured</p>
      </div>
      <!-- Duration -->
      <div class="glass rounded-2xl p-6 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all duration-300"></div>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Duration</p>
        <h3 class="text-4xl font-extrabold mt-2 text-cyan-400 font-display">${(totalDuration / 1000).toFixed(1)}s</h3>
        <p class="text-[11px] text-slate-500 font-mono mt-1">E2E Execution elapsed</p>
      </div>
    </div>

    <!-- Center layout: Charts & Suite status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-slate-900 pb-6">
      <!-- Suites Status Breakdown -->
      <div class="glass rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-bold font-display border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <span>Verify Status by Module Category</span>
            <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded font-mono uppercase tracking-widest ${successRate >= 95 ? 'animate-pulse' : ''}">
              ${successRate >= 95 ? 'Passed Threshold' : 'Failed Threshold'}
            </span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2">
            ${modulesList.map(s => {
              return `
              <div class="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div class="flex items-start justify-between">
                  <div>
                    <h4 class="font-bold text-sm text-slate-200 font-display">${s.name}</h4>
                    <p class="text-[11px] text-slate-500 font-mono mt-0.5">${s.total} test cases</p>
                  </div>
                  <span class="text-xs font-mono font-bold ${s.rate >= 95 ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 'text-rose-400 bg-rose-500/5 border-rose-500/10'} px-2 py-1 rounded border">${s.rate.toFixed(1)}% OK</span>
                </div>
                <div class="mt-4">
                  <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>Passed: <strong>${s.passed}</strong> / ${s.total}</span>
                    <span class="font-mono text-slate-500">${s.failed} failures</span>
                  </div>
                  <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/50">
                    <div class="${s.rate >= 95 ? 'bg-emerald-500' : 'bg-rose-500'} h-full rounded-full" style="width: ${s.rate}%"></div>
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Pie Chart summary -->
      <div class="glass rounded-2xl p-6 flex flex-col justify-between items-center text-center">
        <div class="w-full text-left">
          <h2 class="text-xl font-bold font-display border-b border-slate-800 pb-3 mb-4">Quality Metrics Ratio</h2>
        </div>
        <div class="w-56 h-56 relative my-auto">
          <canvas id="ratioChart"></canvas>
        </div>
        <div class="flex items-center gap-6 justify-center mt-4 w-full">
          <div class="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Passed: ${passed}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span class="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Failed: ${failed}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span class="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> Skipped: ${skipped}
          </div>
        </div>
      </div>
    </div>

    <!-- Excel Downloads -->
    <section class="glass rounded-2xl p-6">
      <h3 class="text-lg font-bold font-display border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
        <span>Generated Excel Audit Files</span>
        <span class="text-[10px] text-slate-500 font-mono uppercase">audit spreadsheets</span>
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="../Excel/Automation_Test_Report.xlsx" target="_blank" class="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 group">
          <div class="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">📊</div>
          <div>
            <h4 class="text-sm font-bold font-display text-slate-200">Master Test Report</h4>
            <p class="text-[11px] text-slate-500 font-mono mt-0.5">Automation_Test_Report.xlsx</p>
          </div>
        </a>
        <a href="../Excel/Passed_Test_Cases.xlsx" target="_blank" class="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 group">
          <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">✓</div>
          <div>
            <h4 class="text-sm font-bold font-display text-slate-200">Passed Test Cases</h4>
            <p class="text-[11px] text-slate-500 font-mono mt-0.5">Passed_Test_Cases.xlsx</p>
          </div>
        </a>
        <a href="../Excel/Failed_Test_Cases.xlsx" target="_blank" class="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 group">
          <div class="p-3 bg-rose-500/10 text-rose-400 rounded-lg group-hover:scale-105 transition-transform">✗</div>
          <div>
            <h4 class="text-sm font-bold font-display text-slate-200">Failed Test Cases</h4>
            <p class="text-[11px] text-slate-500 font-mono mt-0.5">Failed_Test_Cases.xlsx</p>
          </div>
        </a>
        <a href="../Excel/Summary_Report.xlsx" target="_blank" class="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 group">
          <div class="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover:scale-105 transition-transform">📈</div>
          <div>
            <h4 class="text-sm font-bold font-display text-slate-200">Execution Summary</h4>
            <p class="text-[11px] text-slate-500 font-mono mt-0.5">Summary_Report.xlsx</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Test Cases Explorer Table -->
    <section class="glass rounded-2xl p-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 class="text-xl font-bold font-display">Test Cases Explorer</h2>
          <p class="text-slate-500 text-xs mt-0.5">Inspect all ${total} executed E2E test cases step-by-step</p>
        </div>
        <div class="flex gap-2">
          <input type="text" id="tableSearch" placeholder="Search test cases..." class="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors w-64">
          <select id="statusFilter" class="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="ALL">All Statuses</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto max-h-[600px] overflow-y-auto border border-slate-900/60 rounded-xl">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-900/80 sticky top-0 text-slate-300 uppercase tracking-wider text-[10px] font-mono border-b border-slate-800">
              <th class="p-3.5 pl-5">Test ID</th>
              <th class="p-3.5">Module</th>
              <th class="p-3.5">Test Case Name</th>
              <th class="p-3.5 text-center">Priority</th>
              <th class="p-3.5 text-center">Status</th>
              <th class="p-3.5 text-center">Duration</th>
            </tr>
          </thead>
          <tbody id="testTableBody" class="divide-y divide-slate-900/50">
            ${testResults.map(r => `
            <tr class="hover:bg-slate-900/30 transition-colors cursor-pointer text-slate-300" onclick="toggleDetails('${r.id}')" data-status="${r.status}" data-search="${r.id} ${r.module} ${r.name}">
              <td class="p-3.5 pl-5 font-mono font-bold text-indigo-400">${r.id}</td>
              <td class="p-3.5 font-medium">${r.module}</td>
              <td class="p-3.5 font-medium text-slate-200">${r.name}</td>
              <td class="p-3.5 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${r.priority === 'P0' ? 'bg-rose-500/10 text-rose-400' : (r.priority === 'P1' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400')}">${r.priority}</span>
              </td>
              <td class="p-3.5 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400' : (r.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')}">${r.status}</span>
              </td>
              <td class="p-3.5 text-center text-slate-500 font-mono">${r.duration || 0}ms</td>
            </tr>
            <tr id="details-${r.id}" class="hidden bg-slate-900/10">
              <td colspan="6" class="p-5 border-t border-slate-900">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-slate-400 text-xs">
                  <div>
                    <h5 class="text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2 font-display">Preconditions</h5>
                    <p class="bg-slate-950/80 border border-slate-900 p-3 rounded-lg leading-relaxed">${r.preconditions || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 class="text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2 font-display">Test Steps</h5>
                    <p class="bg-slate-950/80 border border-slate-900 p-3 rounded-lg leading-relaxed whitespace-pre-line">${r.steps || 'N/A'}</p>
                  </div>
                  <div>
                    <h5 class="text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2 font-display">Expected Result</h5>
                    <p class="bg-slate-950/80 border border-slate-900 p-3 rounded-lg leading-relaxed mb-4">${r.expected || 'N/A'}</p>
                    ${r.error ? `
                    <h5 class="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-2 font-display">Failure Reason</h5>
                    <pre class="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg text-rose-300 font-mono whitespace-pre-wrap">${r.error}</pre>
                    ${r.screenshot ? `
                    <div class="mt-4">
                      <h5 class="text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2 font-display">Screenshot Evidence</h5>
                      <img src="../Screenshots/${r.screenshot}" class="border border-slate-800 rounded-lg max-w-full h-auto cursor-zoom-in" onclick="window.open('../Screenshots/${r.screenshot}')"/>
                    </div>
                    ` : ''}
                    ` : ''}
                  </div>
                </div>
              </td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <footer class="border-t border-slate-900 py-6 mt-12 bg-slate-950/40 text-center text-slate-600 text-[10px] font-mono uppercase tracking-widest">
    Smart Pantry Selenium E2E Automation Dashboard &copy; 2026.
  </footer>

  <script>
    // Initialize doughnut chart
    const ctx = document.getElementById('ratioChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Skipped'],
        datasets: [{
          data: [${passed}, ${failed}, ${skipped}],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
          borderColor: '#020617',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        cutout: '75%'
      }
    });

    // Toggle details row
    function toggleDetails(id) {
      const el = document.getElementById('details-' + id);
      el.classList.toggle('hidden');
    }

    // Search and Filter functionality
    const searchInput = document.getElementById('tableSearch');
    const statusFilter = document.getElementById('statusFilter');
    const tableBody = document.getElementById('testTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr[data-status]'));

    function filterTable() {
      const searchVal = searchInput.value.toLowerCase();
      const statusVal = statusFilter.value;

      rows.forEach(row => {
        const matchesStatus = (statusVal === 'ALL' || row.getAttribute('data-status') === statusVal);
        const matchesSearch = row.getAttribute('data-search').toLowerCase().includes(searchVal);
        const id = row.getAttribute('data-search').split(' ')[0];
        const detailsRow = document.getElementById('details-' + id);

        if (matchesStatus && matchesSearch) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
          if (detailsRow) detailsRow.classList.add('hidden');
        }
      });
    }

    searchInput.addEventListener('input', filterTable);
    statusFilter.addEventListener('change', filterTable);
  </script>
</body>
</html>
  `;

  // Write html files
  fs.writeFileSync(path.join(resultsHtmlDir, 'execution-report.html'), reportHtml);
  fs.writeFileSync(path.join(resultsHtmlDir, 'dashboard.html'), reportHtml);
  
  fs.writeFileSync(path.join(localReportsDir, 'execution-report.html'), reportHtml);
  fs.writeFileSync(path.join(localReportsDir, 'dashboard.html'), reportHtml);
  
  fs.writeFileSync(path.join(docsDir, 'execution-report.html'), reportHtml);
  fs.writeFileSync(path.join(docsDir, 'dashboard.html'), reportHtml);

  logger.info('HTML Reports written successfully.');
}

module.exports = {
  generateHTMLReports
};
