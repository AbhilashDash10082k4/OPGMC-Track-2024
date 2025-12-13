/**
 * Test & Debug Utility for PDF Fragment Parser
 * Use this to quickly test and debug the parser with your data
 */

import { loadFragmentsFile, AdmissionDataParser } from './parsePdfData';
import * as path from 'path';
import * as fs from 'fs';

// ============= Debug Functions =============

/**
 * Analyzes the x-coordinate distribution to help determine column boundaries
 */
function analyzeColumnBoundaries(filePath: string): void {
  console.log('=== Column Boundary Analysis ===\n');
  
  const data = loadFragmentsFile(filePath);
  const allFragments = data.flat();
  
  // Collect all x0 values
  const x0Values = allFragments.map(f => f.x0).sort((a, b) => a - b);
  
  // Find clusters
  console.log('X-coordinate distribution:');
  console.log(`Min x0: ${Math.min(...x0Values)}`);
  console.log(`Max x0: ${Math.max(...x0Values)}`);
  console.log(`Total fragments: ${x0Values.length}\n`);
  
  // Group by x0 ranges
  const ranges = [
    { name: 'Serial No', min: 0, max: 40 },
    { name: 'Roll No', min: 40, max: 92 },
    { name: 'Percentile', min: 92, max: 143 },
    { name: 'Application', min: 143, max: 198 },
    { name: 'Name', min: 198, max: 285 },
    { name: 'Merit Rank', min: 285, max: 470 },
    { name: 'Admission Status', min: 470, max: 540 },
    { name: 'Admitted Course', min: 540, max: 598 },
    { name: 'Admitted College', min: 598, max: 648 },
    { name: 'Admitted Subject', min: 648, max: 698 },
    { name: 'Category', min: 698, max: 733 },
    { name: 'Round', min: 733, max: 800 },
  ];
  
  console.log('Fragments per column:');
  ranges.forEach(range => {
    const count = x0Values.filter(x => x >= range.min && x < range.max).length;
    if (count > 0) {
      console.log(`  ${range.name.padEnd(20)} [${range.min}-${range.max}): ${count} fragments`);
    }
  });
}

/**
 * Shows sample text fragments from a specific column range
 */
function inspectColumn(
  filePath: string, 
  minX: number, 
  maxX: number, 
  limit: number = 20
): void {
  console.log(`\n=== Inspecting Column [${minX}-${maxX}] ===\n`);
  
  const data = loadFragmentsFile(filePath);
  const allFragments = data.flat();
  
  const columnFragments = allFragments
    .filter(f => f.x0 >= minX && f.x0 < maxX)
    .slice(0, limit);
  
  console.log(`Found ${columnFragments.length} fragments (showing first ${limit}):\n`);
  
  columnFragments.forEach((f, i) => {
    console.log(`${i + 1}. "${f.text}" at x0=${f.x0.toFixed(2)}, y=${f.y_center.toFixed(2)}`);
  });
}

/**
 * Shows raw data for a specific row (by y_center)
 */
function inspectRow(
  filePath: string,
  targetY: number,
  tolerance: number = 3
): void {
  console.log(`\n=== Inspecting Row at y=${targetY} (±${tolerance}) ===\n`);
  
  const data = loadFragmentsFile(filePath);
  const allFragments = data.flat();
  
  const rowFragments = allFragments
    .filter(f => Math.abs(f.y_center - targetY) <= tolerance)
    .sort((a, b) => a.x0 - b.x0);
  
  console.log(`Found ${rowFragments.length} fragments:\n`);
  
  rowFragments.forEach(f => {
    console.log(`  x0=${f.x0.toFixed(1).padStart(6)}: "${f.text}"`);
  });
}

/**
 * Compares parsed output with raw data for verification
 */
function verifyParsing(filePath: string, recordIndex: number = 0): void {
  console.log(`\n=== Verification: Record #${recordIndex + 1} ===\n`);
  
  const data = loadFragmentsFile(filePath);
  const parser = new AdmissionDataParser();
  const records = parser.parse(data);
  
  if (recordIndex >= records.length) {
    console.log(`Error: Record index ${recordIndex} out of bounds (${records.length} total)`);
    return;
  }
  
  const record = records[recordIndex];
  
  console.log('Parsed Record:');
  console.log(JSON.stringify(record, null, 2));
  console.log('\nVerify this matches the expected data from the PDF.');
}

/**
 * Tests different tolerance values
 */
function testTolerances(filePath: string): void {
  console.log('\n=== Testing Different Y-Tolerances ===\n');
  
  const data = loadFragmentsFile(filePath);
  const tolerances = [1, 2, 3, 5, 10];
  
  tolerances.forEach(tolerance => {
    const parser = new AdmissionDataParser({ yTolerance: tolerance });
    const records = parser.parse(data);
    console.log(`Tolerance ${tolerance}: ${records.length} records extracted`);
  });
}

/**
 * Generates a report of all unique values in each column
 */
function generateColumnReport(filePath: string, outputPath?: string): void {
  console.log('\n=== Column Value Report ===\n');
  
  const data = loadFragmentsFile(filePath);
  const parser = new AdmissionDataParser();
  const records = parser.parse(data);
  
  const report: any = {
    totalRecords: records.length,
    columns: {} as any,
  };
  
  // Analyze each column
  const columns = ['admission_status', 'admitted_course', 'admitted_college', 'admitted_subject'];
  
  columns.forEach(col => {
    const values = records.map(r => r[col as keyof typeof r]).filter(v => v.length > 0);
    const uniqueValues = Array.from(new Set(values));
    
    report.columns[col] = {
      totalValues: values.length,
      uniqueValues: uniqueValues.length,
      samples: uniqueValues.slice(0, 10),
      emptyCount: records.length - values.length,
    };
    
    console.log(`${col}:`);
    console.log(`  Total: ${values.length}, Unique: ${uniqueValues.length}, Empty: ${records.length - values.length}`);
    console.log(`  Samples: ${uniqueValues.slice(0, 3).join(', ')}`);
    console.log();
  });
  
  // Save report
  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${outputPath}`);
  }
}

/**
 * Quick test with first few records
 */
function quickTest(filePath: string): void {
  console.log('\n=== Quick Test ===\n');
  
  try {
    const data = loadFragmentsFile(filePath);
    console.log(`✓ File loaded: ${data.length} pages\n`);
    
    const parser = new AdmissionDataParser();
    const records = parser.parse(data);
    console.log(`✓ Parsed: ${records.length} records\n`);
    
    console.log('First 3 records:\n');
    records.slice(0, 3).forEach((r, i) => {
      console.log(`${i + 1}. ${JSON.stringify(r, null, 2)}\n`);
    });
    
    console.log('✓ Test passed!');
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

// ============= Main Test Runner =============

async function main() {
  const filePath = path.join(__dirname, 'pdf_fragments.js');
  
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   PDF Parser Debug Utility            ║');
  console.log('╚═══════════════════════════════════════╝\n');
  
  // Uncomment the tests you want to run:
  
  quickTest(filePath);
  
  // analyzeColumnBoundaries(filePath);
  
  // inspectColumn(filePath, 472, 540); // Admission Status column
  // inspectColumn(filePath, 598, 648); // Admitted College column
  
  // inspectRow(filePath, 162.95); // Inspect a specific row
  
  // verifyParsing(filePath, 0); // Verify first record
  
  // testTolerances(filePath);
  
  // generateColumnReport(filePath, './column_report.json');
}

// Run
if (require.main === module) {
  main().catch(console.error);
}

export {
  analyzeColumnBoundaries,
  inspectColumn,
  inspectRow,
  verifyParsing,
  testTolerances,
  generateColumnReport,
  quickTest,
};
