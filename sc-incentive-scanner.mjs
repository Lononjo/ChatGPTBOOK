#!/usr/bin/env node

/**
 * SC Code Complete Tax Incentive Scanner - Sonnet 4.6 Edition
 */

import Anthropic from "@anthropic-ai/sdk";
import https from "https";
import fs from "fs";
import { URL } from "url";

const client = new Anthropic();

const CONFIG = {
  model: "claude-sonnet-4-20250610",
  targetTitles: [12, 11, 4, 6, 27, 10, 5],
  maxChaptersPerTitle: 15,
  maxSectionsPerChapter: 20,
  requestDelayMs: 1000,
  progressFile: "sc_incentives_progress.json",
  outputFile: "sc_incentives_complete.json",
  baseUrl: "https://law.justia.com/codes/south-carolina/2025",
};

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

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        "User-Agent": "SCCodeScanner/2.0 (Legal Research)",
      },
      timeout: 10000,
    };

    const req = https
      .request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", reject);

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.end();
  });
}

function extractChapters(html) {
  const chapters = [];
  // Justia uses links like /chapter-1/ and displays chapter names
  const chapterPattern =
    /\/chapter-([0-9a-z]+)\/?["'][^>]*>([^<]*)<\/a>/gi;
  let match;

  while ((match = chapterPattern.exec(html)) !== null) {
    const title = match[2].trim().replace(/^Chapter\s+\S+\s*[-:.]\s*/i, "");
    if (title.length > 0) {
      chapters.push({
        number: match[1],
        title: title.substring(0, 100),
      });
    }
  }

  // Fallback: broader pattern
  if (chapters.length === 0) {
    const fallback =
      /Chapter\s+([0-9A-Za-z]+)\s*[-:]?\s*([^<\n]*?)(?=<|Chapter|$)/gi;
    while ((match = fallback.exec(html)) !== null) {
      chapters.push({
        number: match[1],
        title: match[2].trim().substring(0, 100),
      });
    }
  }

  return [...new Map(chapters.map((c) => [c.number, c])).values()];
}

function extractSections(html) {
  const sections = [];
  // Justia links like /section-12-1-10/ with section text
  const sectionPattern =
    /\/section-(\d+-\d+-\d+)\/?["'][^>]*>([^<]*)<\/a>/gi;
  let match;

  while ((match = sectionPattern.exec(html)) !== null) {
    sections.push({
      cite: match[1],
      title: match[2].trim().substring(0, 150),
    });
  }

  // Fallback
  if (sections.length === 0) {
    const fallback =
      /(?:SECTION|§)\s+(\d+-\d+-\d+)\s*[-:]?\s*([^<\n]*?)(?=SECTION|§|$)/gi;
    while ((match = fallback.exec(html)) !== null) {
      sections.push({
        cite: match[1],
        title: match[2].trim().substring(0, 150),
      });
    }
  }

  return sections;
}

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
    const jsonMatch = text.match(/\[.*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
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
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error(
      `    Warning: Parse error for ${sectionCite}: ${e.message.substring(0, 50)}`
    );
  }

  return [];
}

async function processChapter(titleNum, chapterNum) {
  progressState.currentlyProcessing = `Title ${titleNum}, Ch ${chapterNum}`;

  const url = `${CONFIG.baseUrl}/title-${titleNum}/chapter-${chapterNum}/`;

  try {
    console.log(
      `  Chapter ${chapterNum} [Incentives found: ${progressState.totalIncentivesFound}]`
    );
    await delay(CONFIG.requestDelayMs);
    const html = await fetchUrl(url);

    const sections = extractSections(html);
    let chapterIncentives = 0;

    for (const section of sections.slice(0, CONFIG.maxSectionsPerChapter)) {
      // Fetch individual section page for full statute text
      let sectionText = section.title;
      try {
        const sectionUrl = `${CONFIG.baseUrl}/title-${titleNum}/chapter-${chapterNum}/section-${section.cite}/`;
        await delay(CONFIG.requestDelayMs);
        const sectionHtml = await fetchUrl(sectionUrl);
        // Strip HTML tags for plain text extraction
        sectionText = sectionHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      } catch (e) {
        // Fall back to chapter-level text
        sectionText = section.title + " " + html.substring(0, 5000);
      }

      const incentives = await extractIncentivesFromSection(
        titleNum,
        chapterNum,
        section.cite,
        sectionText
      );

      if (incentives && incentives.length > 0) {
        for (const inc of incentives) {
          progressState.incentives.push(inc);
          progressState.totalIncentivesFound++;
          chapterIncentives++;
        }
      }

      await delay(CONFIG.requestDelayMs / 4);
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

async function processTitle(titleNum) {
  console.log(`\nTitle ${titleNum}`);
  progressState.currentlyProcessing = `Title ${titleNum}`;

  const url = `${CONFIG.baseUrl}/title-${titleNum}/`;

  try {
    await delay(CONFIG.requestDelayMs);
    const html = await fetchUrl(url);
    const chapters = extractChapters(html);

    console.log(`  ${chapters.length} chapters found`);

    if (chapters.length === 0) return;

    console.log(`  Filtering with Sonnet 4.6...`);
    const relevantChapters = await identifyIncentiveChapters(
      titleNum,
      chapters
    );
    console.log(
      `  ${relevantChapters.length} chapters contain likely incentives`
    );

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

function saveProgress() {
  fs.writeFileSync(
    CONFIG.progressFile,
    JSON.stringify(progressState, null, 2)
  );
}

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
      console.error(`Could not load progress: ${e.message}`);
      return false;
    }
  }
  return false;
}

function generateReport() {
  console.log("\n" + "=".repeat(80));
  console.log("SCAN COMPLETE - SC TAX INCENTIVE COMPREHENSIVE MAP");
  console.log("=".repeat(80));

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

  if (shouldResume && loadProgress()) {
    console.log("Resuming previous scan...\n");
  } else {
    console.log(
      `Starting fresh scan of ${customTitles.length} title(s)...\n`
    );
  }

  const titlesToProcess = customTitles.filter(
    (t) => !progressState.titlesCompleted.includes(t)
  );

  if (titlesToProcess.length === 0) {
    console.log("All titles already scanned!");
    generateReport();
    return;
  }

  for (const titleNum of titlesToProcess) {
    await processTitle(titleNum);
  }

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
