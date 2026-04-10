#!/usr/bin/env node

/**
 * SC Code Complete Tax Incentive Scanner - Sonnet 4.6 Edition
 * Systematically scrapes and analyzes entire SC Code for tax incentives
 *
 * Optimized for:
 * - Claude Sonnet 4.6 (superior legal reasoning)
 * - Claude Code execution
 * - Persistent progress tracking
 *
 * Usage:
 * node sc_code_scanner_sonnet.js                    # Scan default titles (12, 11, 4)
 * node sc_code_scanner_sonnet.js --titles=12        # Scan only Title 12
 * node sc_code_scanner_sonnet.js --resume           # Resume from last checkpoint
 */

import Anthropic from "@anthropic-ai/sdk";
import https from "https";
import fs from "fs";
import { URL } from "url";

const client = new Anthropic();

// Configuration - tuned for thorough but efficient scanning
const CONFIG = {
  model: "claude-sonnet-4-20250610", // Sonnet 4.6
  targetTitles: [12, 11, 4, 6, 27, 10, 5], // Tax, Finance, Counties, Property, etc.
  maxChaptersPerTitle: 15, // Increased for more comprehensive coverage
  maxSectionsPerChapter: 20,
  requestDelayMs: 800, // Slightly faster with Sonnet (still respectful)
  progressFile: "sc_incentives_progress.json",
  outputFile: "sc_incentives_complete.json",
};

// State management
let progressState = {
  scanStartTime: new Date().toISOString(),
  titlesCompleted: [],
  totalIncentivesFound: 0,
  incentives: [],
  currentlyProcessing: null,
  errors: [],
  apiCallsUsed: 0,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch URL with timeout
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        "User-Agent": "SCCodeScanner/2.0 (Sonnet 4.6)",
      },
      timeout: 10000,
    };

    https
      .request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", reject)
      .end();
  });
}

// Extract chapters from title page HTML
function extractChapters(html) {
  const chapters = [];
  const chapterPattern =
    /Chapter\s+([0-9A-Za-z]+)\s*[-:]?\s*([^<\n]*?)(?=<|Chapter|$)/gi;
  let match;

  while ((match = chapterPattern.exec(html)) !== null) {
    chapters.push({
      number: match[1],
      title: match[2].trim().substring(0, 100),
    });
  }

  return [...new Map(chapters.map((c) => [c.number, c])).values()];
}

// Extract sections from chapter HTML
function extractSections(html) {
  const sections = [];
  const sectionPattern =
    /(?:SECTION|§)\s+(\d+-\d+-\d+)\s*[-:]?\s*([^<\n]*?)(?=SECTION|§|$)/gi;
  let match;

  while ((match = sectionPattern.exec(html)) !== null) {
    sections.push({
      cite: match[1],
      title: match[2].trim().substring(0, 150),
    });
  }

  return sections;
}

// Use Sonnet 4.6 to identify chapters with incentives
async function identifyIncentiveChapters(titleNum, chapters) {
  if (chapters.length === 0) return [];

  const chapterList = chapters
    .map((c) => `Chapter ${c.number}: ${c.title}`)
    .join("\n");

  const prompt = `You are an expert SC tax attorney. Identify which chapters likely contain tax incentives, credits, deductions, exemptions, or economic benefits.

Title ${titleNum} chapters:
${chapterList}

Return ONLY a JSON array of chapter numbers. Example: ["1", "5", "23"]
If none, return: []`;

  try {
    const response = await client.messages.create({
      model: CONFIG.model,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    progressState.apiCallsUsed++;
    const text = response.content[0].text;
    const match = text.match(/\[.*?\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {
    console.error(`  Warning: Filter error for Title ${titleNum}: ${e.message}`);
    progressState.errors.push({
      stage: "chapter_filter",
      title: titleNum,
      error: e.message,
      timestamp: new Date().toISOString(),
    });
  }

  return [];
}

// Extract incentives from section text using Sonnet 4.6
async function extractIncentivesFromSection(
  titleNum,
  chapterNum,
  sectionCite,
  sectionText
) {
  const prompt = `Extract all tax incentives from this SC statute section. Sonnet 4.6 legal reasoning mode.

Section: ${sectionCite}
Text:
${sectionText.substring(0, 4000)}

Return ONLY JSON array (or empty array if no incentives):

[
  {
    "cite": "SC Code § ${sectionCite}",
    "name": "Official name",
    "type": "Tax Credit | Deduction | Exemption | Grant | Abatement | Fees in Lieu | Other",
    "description": "2-3 sentence plain English description",
    "eligibility": "Key requirements (comma-separated)",
    "benefit": "What taxpayer receives",
    "benefitCap": "Maximum or 'Unlimited'",
    "status": "Active | Repealed | Transitional"
  }
]`;

  try {
    const response = await client.messages.create({
      model: CONFIG.model,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    progressState.apiCallsUsed++;
    const text = response.content[0].text;
    const match = text.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error(
      `    Warning: Parse error for ${sectionCite}: ${e.message.substring(0, 50)}`
    );
  }

  return [];
}

// Process a single chapter
async function processChapter(titleNum, chapterNum) {
  progressState.currentlyProcessing = `Title ${titleNum}, Ch ${chapterNum}`;

  const url = `https://www.scstatehouse.gov/code/t${titleNum
    .toString()
    .padStart(2, "0")}c${chapterNum.toString().padStart(2, "0")}.php`;

  try {
    console.log(
      `  Chapter ${chapterNum} [Incentives found: ${progressState.totalIncentivesFound}]`
    );
    await delay(CONFIG.requestDelayMs);
    const html = await fetchUrl(url);

    const sections = extractSections(html);
    let chapterIncentives = 0;

    // Analyze sections
    for (const section of sections.slice(0, CONFIG.maxSectionsPerChapter)) {
      const incentives = await extractIncentivesFromSection(
        titleNum,
        chapterNum,
        section.cite,
        section.title + " " + html.substring(0, 5000)
      );

      if (incentives && incentives.length > 0) {
        for (const inc of incentives) {
          progressState.incentives.push(inc);
          progressState.totalIncentivesFound++;
          chapterIncentives++;
        }
      }

      await delay(CONFIG.requestDelayMs / 2);
    }

    if (chapterIncentives > 0) {
      console.log(`     Found ${chapterIncentives} incentive(s)`);
    }

    saveProgress();
    return chapterIncentives;
  } catch (e) {
    console.error(`  Error in Chapter ${chapterNum}: ${e.message}`);
    progressState.errors.push({
      stage: "chapter_analysis",
      title: titleNum,
      chapter: chapterNum,
      error: e.message,
      timestamp: new Date().toISOString(),
    });
    return 0;
  }
}

// Process a single title
async function processTitle(titleNum) {
  console.log(`\nTitle ${titleNum}`);
  progressState.currentlyProcessing = `Title ${titleNum}`;

  const url = `https://www.scstatehouse.gov/code/title${titleNum}.php`;

  try {
    await delay(CONFIG.requestDelayMs);
    const html = await fetchUrl(url);
    const chapters = extractChapters(html);

    console.log(`  ${chapters.length} chapters found`);

    if (chapters.length === 0) return;

    // Identify relevant chapters
    console.log(`  Filtering with Sonnet 4.6...`);
    const relevantChapters = await identifyIncentiveChapters(
      titleNum,
      chapters
    );
    console.log(
      `  ${relevantChapters.length} chapters contain likely incentives`
    );

    // Process each chapter
    for (const chapterNum of relevantChapters.slice(
      0,
      CONFIG.maxChaptersPerTitle
    )) {
      await processChapter(titleNum, chapterNum);
    }

    progressState.titlesCompleted.push(titleNum);
    saveProgress();
  } catch (e) {
    console.error(`Title ${titleNum} error: ${e.message}`);
    progressState.errors.push({
      stage: "title_analysis",
      title: titleNum,
      error: e.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Save progress to disk
function saveProgress() {
  fs.writeFileSync(
    CONFIG.progressFile,
    JSON.stringify(progressState, null, 2)
  );
}

// Load existing progress
function loadProgress() {
  if (fs.existsSync(CONFIG.progressFile)) {
    try {
      progressState = JSON.parse(
        fs.readFileSync(CONFIG.progressFile, "utf-8")
      );
      console.log(`Loaded progress:`);
      console.log(
        `   Titles completed: ${progressState.titlesCompleted.join(", ")}`
      );
      console.log(
        `   Incentives found: ${progressState.totalIncentivesFound}`
      );
      console.log(`   API calls used: ${progressState.apiCallsUsed}\n`);
      return true;
    } catch (e) {
      console.error(`Warning: Could not load progress: ${e.message}`);
      return false;
    }
  }
  return false;
}

// Generate final report
function generateReport() {
  console.log("\n" + "=".repeat(80));
  console.log("SCAN COMPLETE - SC TAX INCENTIVE COMPREHENSIVE MAP");
  console.log("=".repeat(80));

  // Breakdown by type
  const byType = {};
  progressState.incentives.forEach((inc) => {
    byType[inc.type] = (byType[inc.type] || 0) + 1;
  });

  console.log("\nSUMMARY BY INCENTIVE TYPE:");
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

  console.log(
    `\nTitles scanned: ${progressState.titlesCompleted.join(", ")}`
  );
  console.log(
    `Total incentives found: ${progressState.totalIncentivesFound}`
  );
  console.log(`API calls used: ${progressState.apiCallsUsed}`);
  console.log(`Errors: ${progressState.errors.length}`);

  const duration = Math.round(
    (Date.now() - new Date(progressState.scanStartTime)) / 1000 / 60
  );
  console.log(`Duration: ${duration} minutes`);

  console.log(`\nFull results: ${CONFIG.outputFile}`);
  console.log(`Progress backup: ${CONFIG.progressFile}`);
  console.log("\nNext steps:");
  console.log("   1. Review extracted_incentives.json");
  console.log("   2. Compare against your current Atlas chapters");
  console.log("   3. Identify gaps and new discoveries");
  console.log("   4. Integrate into Atlas v017+\n");
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldResume = args.includes("--resume");
  const titleArg = args.find((a) => a.startsWith("--titles="));
  const customTitles = titleArg
    ? titleArg.split("=")[1].split(",").map(Number)
    : CONFIG.targetTitles;

  console.log(`\nSC Code Complete Scanner - Sonnet 4.6 Edition\n`);
  console.log(`Model: ${CONFIG.model}`);
  console.log(`Output: ${CONFIG.outputFile}\n`);

  // Check if resuming
  if (shouldResume && loadProgress()) {
    console.log("Resuming previous scan...\n");
  } else {
    console.log(
      `Starting fresh scan of ${customTitles.length} title(s)...\n`
    );
  }

  // Process titles not yet completed
  const titlesToProcess = customTitles.filter(
    (t) => !progressState.titlesCompleted.includes(t)
  );

  if (titlesToProcess.length === 0) {
    console.log("All titles already scanned!");
    generateReport();
    return;
  }

  // Main scan loop
  for (const titleNum of titlesToProcess) {
    await processTitle(titleNum);
  }

  // Save final output
  fs.writeFileSync(
    CONFIG.outputFile,
    JSON.stringify(
      {
        scanMetadata: {
          date: new Date().toISOString(),
          model: CONFIG.model,
          durationMinutes: Math.round(
            (Date.now() - new Date(progressState.scanStartTime)) / 1000 / 60
          ),
          titlesScanned: progressState.titlesCompleted,
          apiCallsUsed: progressState.apiCallsUsed,
        },
        summary: {
          totalIncentivesFound: progressState.totalIncentivesFound,
          errorsEncountered: progressState.errors.length,
        },
        incentives: progressState.incentives,
        errors: progressState.errors,
      },
      null,
      2
    )
  );

  generateReport();
}

main().catch((e) => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
