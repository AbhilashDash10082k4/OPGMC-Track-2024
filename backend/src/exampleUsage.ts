/**
 * Example Usage of PDF Fragment Parser
 */

import { parseAdmissionData, AdmissionDataParser, loadFragmentsFile } from './parsePdfData';
import * as path from 'path';

// ============= Example 1: Simple Usage =============
async function example1() {
  console.log('Example 1: Basic parsing\n');
  
  const records = await parseAdmissionData();
  console.log(`Parsed ${records.length} records`);
}

// ============= Example 2: Custom Paths =============
async function example2() {
  console.log('Example 2: Custom input/output paths\n');
  
  const inputPath = path.join(__dirname, 'pdf_fragments.js');
  const outputPath = path.join(__dirname, 'output/admissions.json');
  
  const records = await parseAdmissionData(inputPath, outputPath);
  console.log(`Saved to custom location: ${outputPath}`);
}

// ============= Example 3: Custom Configuration =============
async function example3() {
  console.log('Example 3: Custom column ranges\n');
  
  const customConfig = {
    yTolerance: 5, // More tolerance for row grouping
    columns: {
      admission_status: { min: 472, max: 540 },
      admitted_course: { min: 540, max: 598 },
      admitted_college: { min: 598, max: 648 },
      admitted_subject: { min: 648, max: 698 },
      // Add more columns if needed
      admitted_category: { min: 698, max: 733 },
      admitted_round: { min: 733, max: 770 },
    },
  };
  
  const records = await parseAdmissionData(undefined, undefined, customConfig);
  console.log(`Parsed with custom config: ${records.length} records`);
}

// ============= Example 4: Manual Parsing =============
function example4() {
  console.log('Example 4: Manual parsing with parser class\n');
  
  const inputPath = path.join(__dirname, 'pdf_fragments.js');
  
  // Load data
  const fragmentData = loadFragmentsFile(inputPath);
  
  // Create parser with custom config
  const parser = new AdmissionDataParser({
    yTolerance: 3,
  });
  
  // Parse
  const records = parser.parse(fragmentData);
  
  console.log(`Manually parsed ${records.length} records`);
  
  // Filter records
  const filteredRecords = records.filter(r => 
    r.admission_status.includes('ALL INDIA')
  );
  
  console.log(`Found ${filteredRecords.length} ALL INDIA admissions`);
  
  return records;
}

// ============= Example 5: Processing Records =============
async function example5() {
  console.log('Example 5: Process and analyze records\n');
  
  const records = await parseAdmissionData();
  
  // Group by admission status
  const statusGroups = records.reduce((acc, record) => {
    const status = record.admission_status || 'UNKNOWN';
    if (!acc[status]) acc[status] = [];
    acc[status].push(record);
    return acc;
  }, {} as Record<string, typeof records>);
  
  console.log('Admission Status Distribution:');
  Object.entries(statusGroups).forEach(([status, records]) => {
    console.log(`  ${status}: ${records.length} records`);
  });
  
  // Find most common colleges
  const collegeCount = records.reduce((acc, record) => {
    const college = record.admitted_college || 'UNKNOWN';
    acc[college] = (acc[college] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topColleges = Object.entries(collegeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('\nTop 5 Colleges:');
  topColleges.forEach(([college, count]) => {
    console.log(`  ${college}: ${count} admissions`);
  });
}

// ============= Run Examples =============
async function main() {
  try {
    // Uncomment the example you want to run
    
    await example1();
    // await example2();
    // await example3();
    // example4();
    // await example5();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { example1, example2, example3, example4, example5 };
