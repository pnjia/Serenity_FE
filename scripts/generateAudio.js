#!/usr/bin/env node

/**
 * Script to generate simple audio tones for the Ritme & Suara game
 * This creates MP3 files for each musical note
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const NOTES = [
  { name: "do", frequency: 261.63 },
  { name: "re", frequency: 293.66 },
  { name: "mi", frequency: 329.63 },
  { name: "fa", frequency: 349.23 },
  { name: "sol", frequency: 392.0 },
  { name: "la", frequency: 440.0 },
];

const outputDir = path.join(__dirname, "..", "assets", "sounds");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateTone(noteName, frequency) {
  const outputFile = path.join(outputDir, `${noteName}.mp3`);

  // Check if ffmpeg is available
  try {
    await execPromise("ffmpeg -version");
  } catch (error) {
    console.log("FFmpeg not found. Generating placeholder files instead.");
    // Create empty placeholder file
    fs.writeFileSync(outputFile, "");
    return;
  }

  // Generate a sine wave tone using ffmpeg
  const duration = 0.5; // 500ms
  const command = `ffmpeg -f lavfi -i "sine=frequency=${frequency}:duration=${duration}" -ac 1 -ar 44100 -b:a 128k -y "${outputFile}"`;

  try {
    await execPromise(command);
    console.log(`Generated: ${noteName}.mp3 (${frequency} Hz)`);
  } catch (error) {
    console.error(`Error generating ${noteName}.mp3:`, error.message);
  }
}

async function generateAllTones() {
  console.log("Generating audio tones for Ritme & Suara game...\n");

  for (const note of NOTES) {
    await generateTone(note.name, note.frequency);
  }

  console.log("\nDone! Audio files are in:", outputDir);
}

generateAllTones().catch(console.error);
