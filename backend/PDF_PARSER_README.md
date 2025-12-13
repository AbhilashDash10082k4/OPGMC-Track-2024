# PDF Fragment Parser

A TypeScript utility to parse `pdf_fragments.js` and extract structured admission data intelligently.

## Overview

This parser reads text fragments extracted from PDF files and reconstructs admission records by:
- Grouping text fragments by row (y-coordinate)
- Identifying column membership based on x-coordinate ranges
- Concatenating text fragments in proper order
- Generating structured JSON output

## Features

- ✅ Smart row detection with configurable tolerance
- ✅ Column-based text extraction
- ✅ Handles multi-word entries across multiple fragments
- ✅ Configurable column boundaries
- ✅ Type-safe TypeScript implementation
- ✅ Error handling and validation
- ✅ Production-ready with detailed logging

## Files

- **`parsePdfData.ts`** - Main production-ready parser (recommended)
- **`exampleUsage.ts`** - Usage examples and patterns
- **`parsePdfFragmentsClean.ts`** - Alternative clean implementation
- **`lib/parsePdfFragments.ts`** - Library version in lib folder

## Quick Start

### 1. Basic Usage

```typescript
import { parseAdmissionData } from './parsePdfData';

// Parse with default settings
const records = await parseAdmissionData();

// Output: parsed_admissions.json
```

### 2. Custom Paths

```typescript
import { parseAdmissionData } from './parsePdfData';

const records = await parseAdmissionData(
  './data/pdf_fragments.js',  // Input path
  './output/results.json'      // Output path
);
```

### 3. Custom Column Configuration

```typescript
import { parseAdmissionData } from './parsePdfData';

const config = {
  yTolerance: 5, // Pixels tolerance for row grouping
  columns: {
    admission_status: { min: 472, max: 540 },
    admitted_course: { min: 540, max: 598 },
    admitted_college: { min: 598, max: 648 },
    admitted_subject: { min: 648, max: 698 },
  },
};

const records = await parseAdmissionData(undefined, undefined, config);
```

## How It Works

### Input Format

The parser expects `pdf_fragments.js` containing an array of pages, each with text fragments:

```javascript
const data = [
  [
    {
      "text": "PG",
      "x0": 472.39,
      "x1": 479.09908,
      "top": 160.01,
      "bottom": 165.89,
      "y_center": 162.95,
      "page": 1
    },
    {
      "text": "MEDICAL",
      "x0": 480.42796,
      "x1": 502.33096,
      "top": 160.01,
      "bottom": 165.89,
      "y_center": 162.95,
      "page": 1
    }
    // ... more fragments
  ]
];
```

### Processing Steps

1. **Row Grouping**: Fragments with similar `y_center` values (within tolerance) are grouped as one row
2. **Column Identification**: Each fragment's `x0` coordinate determines which column it belongs to
3. **Text Concatenation**: Fragments in the same row+column are sorted by x-position and concatenated
4. **Record Creation**: Each row becomes an admission record

### Output Format

```json
[
  {
    "admission_status": "PG MEDICAL ODISHA",
    "admitted_course": "PG MEDICAL ODISHA",
    "admitted_college": "MKCG MCH BERHAMPUR",
    "admitted_subject": "RADIODIAGNOSIS"
  },
  {
    "admission_status": "ALL INDIA ADM",
    "admitted_course": "",
    "admitted_college": "",
    "admitted_subject": ""
  }
]
```

## Column Boundaries

Default column ranges (in pixels):

| Column | Min X | Max X |
|--------|-------|-------|
| admission_status | 472 | 540 |
| admitted_course | 540 | 598 |
| admitted_college | 598 | 648 |
| admitted_subject | 648 | 698 |

**Note**: Adjust these based on your PDF layout by inspecting the x0/x1 values in your data.

## Configuration Options

```typescript
interface ParserConfig {
  yTolerance: number; // Tolerance for grouping rows (default: 3)
  columns: {
    [columnName: string]: {
      min: number; // Minimum x-coordinate
      max: number; // Maximum x-coordinate
    };
  };
}
```

## Running the Parser

### Command Line

```bash
# Using ts-node
npx ts-node src/parsePdfData.ts

# Or compile and run
tsc && node dist/parsePdfData.js
```

### Programmatic

```typescript
import { parseAdmissionData } from './parsePdfData';

async function main() {
  try {
    const records = await parseAdmissionData();
    console.log(`Parsed ${records.length} records`);
    
    // Process records...
    records.forEach(record => {
      console.log(record.admitted_college);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Advanced Usage

### Filter Results

```typescript
const records = await parseAdmissionData();

// Filter by status
const allIndiaAdmissions = records.filter(r => 
  r.admission_status.includes('ALL INDIA')
);

// Filter by college
const specificCollege = records.filter(r =>
  r.admitted_college.includes('MKCG')
);
```

### Statistics

```typescript
const records = await parseAdmissionData();

// Count by status
const statusCounts = records.reduce((acc, r) => {
  acc[r.admission_status] = (acc[r.admission_status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Distribution:', statusCounts);
```

### Export to CSV

```typescript
import * as fs from 'fs';

const records = await parseAdmissionData();

const csv = [
  'Admission Status,Course,College,Subject',
  ...records.map(r => 
    `"${r.admission_status}","${r.admitted_course}","${r.admitted_college}","${r.admitted_subject}"`
  )
].join('\n');

fs.writeFileSync('output.csv', csv);
```

## Troubleshooting

### Issue: Empty or Missing Fields

**Solution**: Adjust column boundaries in config to match your PDF layout.

```typescript
// Inspect your data first
const fragments = loadFragmentsFile('./pdf_fragments.js');
console.log(fragments[0].slice(0, 10)); // Check x0 values

// Adjust ranges accordingly
const config = {
  columns: {
    admission_status: { min: 470, max: 545 }, // Wider range
    // ...
  }
};
```

### Issue: Text Not Concatenating Properly

**Solution**: Increase `yTolerance` if text fragments are slightly misaligned vertically.

```typescript
const config = {
  yTolerance: 5, // Increase from default 3
};
```

### Issue: File Not Found

**Solution**: Use absolute paths or verify file location.

```typescript
import * as path from 'path';

const inputPath = path.resolve(__dirname, 'pdf_fragments.js');
const records = await parseAdmissionData(inputPath);
```

## Dependencies

- Node.js >= 14
- TypeScript >= 4.5
- `fs` (built-in)
- `path` (built-in)

## Type Definitions

```typescript
interface TextFragment {
  text: string;
  x0: number;      // Left x-coordinate
  x1: number;      // Right x-coordinate
  top: number;     // Top y-coordinate
  bottom: number;  // Bottom y-coordinate
  y_center: number; // Center y-coordinate
  page: number;    // Page number
}

interface AdmissionRecord {
  admission_status: string;
  admitted_course: string;
  admitted_college: string;
  admitted_subject: string;
}
```

## Examples

See `exampleUsage.ts` for complete working examples including:
- Basic parsing
- Custom paths
- Custom configuration
- Manual parsing
- Data analysis and statistics

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
