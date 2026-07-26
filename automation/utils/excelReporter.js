const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

// Ensure Excel directory exists
const resultsExcelDir = path.join(config.paths.testResults, 'Excel');
const localReportsDir = config.paths.reports;
const docsDir = path.join(__dirname, '../../docs');

[resultsExcelDir, localReportsDir, docsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateExcelReports(testResults, metadata) {
  logger.info('Starting Excel Report compilation...');
  
  const borderThin = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } }
  };
  const darkNavyBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  const lightIndigoBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEF2F6' } };
  const passedBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
  const failedBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
  const skippedBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };

  function setupWorksheetColumns(ws) {
    ws.columns = [
      { header: 'Test ID', key: 'id', width: 18 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Test Name', key: 'name', width: 38 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Execution Time (ms)', key: 'duration', width: 22 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Preconditions', key: 'preconditions', width: 35 },
      { header: 'Test Steps', key: 'steps', width: 45 },
      { header: 'Expected Result', key: 'expected', width: 45 },
      { header: 'Failure Reason', key: 'error', width: 50 }
    ];
    ws.getRow(1).height = 30;
    ws.getRow(1).eachCell(cell => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = darkNavyBg;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = borderThin;
    });
  }

  function addRowData(ws, items) {
    items.forEach((item, idx) => {
      const row = ws.addRow({
        id: item.id,
        module: item.module,
        name: item.name,
        status: item.status,
        duration: item.duration || 0,
        priority: item.priority,
        preconditions: item.preconditions || 'N/A',
        steps: item.steps || 'N/A',
        expected: item.expected || 'N/A',
        error: item.error || ''
      });
      row.height = 22;
      row.eachCell((cell, colNum) => {
        cell.border = borderThin;
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.alignment = { vertical: 'middle', horizontal: colNum === 4 || colNum === 6 ? 'center' : 'left', wrapText: true };
        
        if (idx % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
        }

        if (colNum === 4) { // Status column
          if (cell.value === 'PASSED') {
            cell.fill = passedBg;
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '065F46' } };
          } else if (cell.value === 'FAILED') {
            cell.fill = failedBg;
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '991B1B' } };
          } else {
            cell.fill = skippedBg;
            cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '92400E' } };
          }
        }
      });
    });
  }

  // Calculate Metrics by Module
  const moduleSummary = {};
  testResults.forEach(r => {
    if (!moduleSummary[r.module]) {
      moduleSummary[r.module] = { total: 0, passed: 0, failed: 0, skipped: 0 };
    }
    moduleSummary[r.module].total++;
    if (r.status === 'PASSED') moduleSummary[r.module].passed++;
    else if (r.status === 'FAILED') moduleSummary[r.module].failed++;
    else moduleSummary[r.module].skipped++;
  });

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'PASSED').length;
  const failedTests = testResults.filter(r => r.status === 'FAILED').length;
  const skippedTests = testResults.filter(r => r.status === 'SKIPPED').length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const totalDuration = testResults.reduce((acc, r) => acc + (r.duration || 0), 0);

  // -----------------------------------------------------------------
  // 1. Automation_Test_Report.xlsx
  // -----------------------------------------------------------------
  const masterWb = new ExcelJS.Workbook();
  
  // Sheet 1: Executed Test Cases
  const execWs = masterWb.addWorksheet('Executed Test Cases');
  setupWorksheetColumns(execWs);
  addRowData(execWs, testResults);

  // Sheet 2: Passed Tests
  const passedWs = masterWb.addWorksheet('Passed Tests');
  setupWorksheetColumns(passedWs);
  addRowData(passedWs, testResults.filter(r => r.status === 'PASSED'));

  // Sheet 3: Failed Tests
  const failedWs = masterWb.addWorksheet('Failed Tests');
  setupWorksheetColumns(failedWs);
  addRowData(failedWs, testResults.filter(r => r.status === 'FAILED'));

  // Sheet 4: Skipped Tests
  const skippedWs = masterWb.addWorksheet('Skipped Tests');
  setupWorksheetColumns(skippedWs);
  addRowData(skippedWs, testResults.filter(r => r.status === 'SKIPPED'));

  // Sheet 5: Execution Metrics
  const metricsWs = masterWb.addWorksheet('Execution Metrics');
  metricsWs.views = [{ showGridLines: true }];
  metricsWs.columns = [
    { key: 'colA', width: 4 },
    { key: 'colB', width: 30 },
    { key: 'colC', width: 16 },
    { key: 'colD', width: 16 },
    { key: 'colE', width: 16 },
    { key: 'colF', width: 16 },
    { key: 'colG', width: 16 }
  ];

  metricsWs.mergeCells('B2:G2');
  const mtCell = metricsWs.getCell('B2');
  mtCell.value = 'E2E Selenium Execution Metrics';
  mtCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  mtCell.fill = darkNavyBg;
  mtCell.alignment = { vertical: 'middle', horizontal: 'center' };
  metricsWs.getRow(2).height = 30;

  metricsWs.getRow(4).values = ['', 'Module Name', 'Total Cases', 'Passed', 'Failed', 'Skipped', 'Pass Rate'];
  metricsWs.getRow(4).eachCell((cell, col) => {
    if (col > 1) {
      cell.font = { name: 'Segoe UI', size: 10, bold: true };
      cell.fill = lightIndigoBg;
      cell.border = borderThin;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  let rowCounter = 5;
  Object.keys(moduleSummary).forEach(modName => {
    const summary = moduleSummary[modName];
    const modRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    const r = metricsWs.getRow(rowCounter);
    r.values = [
      '',
      modName,
      summary.total,
      summary.passed,
      summary.failed,
      summary.skipped,
      modRate.toFixed(2) + '%'
    ];
    r.eachCell((cell, col) => {
      if (col > 1) {
        cell.border = borderThin;
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : 'center' };
      }
    });
    rowCounter++;
  });

  // Sheet 6: Defect Summary
  const defectWs = masterWb.addWorksheet('Defect Summary');
  defectWs.views = [{ showGridLines: true }];
  defectWs.columns = [
    { header: 'Test ID', key: 'id', width: 18 },
    { header: 'Module', key: 'module', width: 22 },
    { header: 'Test Scenario', key: 'name', width: 38 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Error Exception Details', key: 'error', width: 65 }
  ];
  defectWs.getRow(1).height = 30;
  defectWs.getRow(1).eachCell(cell => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = darkNavyBg;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  const defects = testResults.filter(r => r.status === 'FAILED');
  if (defects.length === 0) {
    const r = defectWs.addRow({ id: 'N/A', module: 'No defects logged', name: 'Perfect Run', priority: 'N/A', error: 'No test failures recorded in this execution run' });
    r.eachCell(c => { c.border = borderThin; c.font = { name: 'Segoe UI', size: 9, italic: true }; });
  } else {
    defects.forEach((d, idx) => {
      const r = defectWs.addRow({ id: d.id, module: d.module, name: d.name, priority: d.priority, error: d.error });
      r.eachCell(cell => {
        cell.border = borderThin;
        cell.font = { name: 'Segoe UI', size: 9 };
        if (idx % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5' } };
        }
      });
    });
  }

  // Save Workbook 1
  const masterPath = path.join(resultsExcelDir, 'Automation_Test_Report.xlsx');
  await masterWb.xlsx.writeFile(masterPath);
  await masterWb.xlsx.writeFile(path.join(localReportsDir, 'Automation_Test_Report.xlsx'));
  await masterWb.xlsx.writeFile(path.join(docsDir, 'Automation_Test_Report.xlsx'));

  // -----------------------------------------------------------------
  // 2. Passed_Test_Cases.xlsx
  // -----------------------------------------------------------------
  const passedWb = new ExcelJS.Workbook();
  const passedOnlyWs = passedWb.addWorksheet('Passed Cases');
  setupWorksheetColumns(passedOnlyWs);
  addRowData(passedOnlyWs, testResults.filter(r => r.status === 'PASSED'));
  await passedWb.xlsx.writeFile(path.join(resultsExcelDir, 'Passed_Test_Cases.xlsx'));
  await passedWb.xlsx.writeFile(path.join(localReportsDir, 'Passed_Test_Cases.xlsx'));
  await passedWb.xlsx.writeFile(path.join(docsDir, 'Passed_Test_Cases.xlsx'));

  // -----------------------------------------------------------------
  // 3. Failed_Test_Cases.xlsx
  // -----------------------------------------------------------------
  const failedWb = new ExcelJS.Workbook();
  const failedOnlyWs = failedWb.addWorksheet('Failed Cases');
  setupWorksheetColumns(failedOnlyWs);
  addRowData(failedOnlyWs, testResults.filter(r => r.status === 'FAILED'));
  await failedWb.xlsx.writeFile(path.join(resultsExcelDir, 'Failed_Test_Cases.xlsx'));
  await failedWb.xlsx.writeFile(path.join(localReportsDir, 'Failed_Test_Cases.xlsx'));
  await failedWb.xlsx.writeFile(path.join(docsDir, 'Failed_Test_Cases.xlsx'));

  // -----------------------------------------------------------------
  // 4. Summary_Report.xlsx
  // -----------------------------------------------------------------
  const summaryWb = new ExcelJS.Workbook();
  const summaryExecWs = summaryWb.addWorksheet('Execution Overview');
  summaryExecWs.views = [{ showGridLines: true }];
  summaryExecWs.columns = [
    { key: 'colA', width: 4 },
    { key: 'colB', width: 32 },
    { key: 'colC', width: 18 },
    { key: 'colD', width: 18 },
    { key: 'colE', width: 18 }
  ];
  
  summaryExecWs.mergeCells('B2:E2');
  const smCell = summaryExecWs.getCell('B2');
  smCell.value = 'E2E Executive Overview';
  smCell.fill = darkNavyBg;
  smCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  smCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  const smRows = [
    ['Total Suite Cases Run', totalTests],
    ['Passed Asserts', passedTests],
    ['Failed Asserts', failedTests],
    ['Skipped Asserts', skippedTests],
    ['Verification Rate', passRate.toFixed(2) + '%'],
    ['Run Duration (Overall)', (totalDuration / 1000).toFixed(2) + ' seconds'],
    ['Run Trigger Timestamp', metadata.date]
  ];

  smRows.forEach((row, idx) => {
    const r = summaryExecWs.getRow(4 + idx);
    r.values = ['', row[0], '', '', row[1]];
    summaryExecWs.mergeCells(`B${4+idx}:D${4+idx}`);
    r.eachCell((cell, col) => {
      if (col > 1) {
        cell.border = borderThin;
        cell.font = { name: 'Segoe UI', size: 10, bold: col === 5 };
        cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : 'center' };
      }
    });
  });

  await summaryWb.xlsx.writeFile(path.join(resultsExcelDir, 'Summary_Report.xlsx'));
  await summaryWb.xlsx.writeFile(path.join(localReportsDir, 'Summary_Report.xlsx'));
  await summaryWb.xlsx.writeFile(path.join(docsDir, 'Summary_Report.xlsx'));

  logger.info('Excel Reports written successfully.');
}

module.exports = {
  generateExcelReports
};
