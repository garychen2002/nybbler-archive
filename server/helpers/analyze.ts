import { spawn } from "child_process";
import { mkdirSync } from "fs";
import { readFile, unlink } from "fs/promises";
import * as path from "path";

function getGhidraScriptPath(scriptName: string) {
  // requires both a Ghidra install (env variable) and JDK 17 (openjdk-17-jdk) on the path
  const ghidra_install_path = process.env.GHIDRA_INSTALL_PATH;
  return path.join(ghidra_install_path!, "support", scriptName);
}

const __dirname = import.meta.dirname;
const output_dir = path.join(__dirname, "..", "projects");
try {
  mkdirSync(output_dir);
} catch {}
const scripts_path = path.join(__dirname, "..", "scripts");
const output_symbol_filename = ".symbols.json";
const output_instructions_filename = ".instructions.json";
const output_decomp_filename = ".decomp.cpp";

export type AnalysisResults = {
  symbols?: { name: string; address: string; type: string; namespace: string; source: string }[];
  instructions?: any[];
  codeUnits?: { address: string; instruction: string }[];
};

// credit to https://ben.page/node-spawn-callback for reference on making a callback with spawn
export const analyze_ghidra = async (file_to_analyze: string): Promise<AnalysisResults> => {
  await new Promise<void>((resolve) => {
    // prettier-ignore
    const args = [
      output_dir, path.basename(file_to_analyze),
      '-import', file_to_analyze,
      "-scriptPath", scripts_path,
      "-postScript", "ExportSymbolInfoScript.java", file_to_analyze + output_symbol_filename,
      "-postScript", "InstructionDisassembler.java", file_to_analyze + output_instructions_filename,
      "-postScript", "DecompilerOutput.java", file_to_analyze + output_decomp_filename,
      // add more postScripts for each script here
      "-deleteProject"
    ];
    const command = spawn(getGhidraScriptPath("analyzeHeadless"), args, {
      shell: process.platform == "win32",
    });
    command.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    command.on("close", () => resolve());
  });

  let results: AnalysisResults = {};

  try {
    results.symbols = JSON.parse(await readFile(file_to_analyze + output_symbol_filename, "utf-8"));
    await unlink(file_to_analyze + output_symbol_filename);
  } catch (error) {
    console.error(error);
  }

  try {
    results.instructions = JSON.parse(
      await readFile(file_to_analyze + output_instructions_filename, "utf-8"),
    );
    await unlink(file_to_analyze + output_instructions_filename);
  } catch (error) {
    console.error(error);
  }

  return results;
};

// if an error happens like being unable to load the input file, the process will still exit
// check for existence of relevant files after usage
