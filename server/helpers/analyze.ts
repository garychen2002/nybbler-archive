import { exec, spawn } from "child_process";
import * as path from 'path';

// requires both a Ghidra install (env variable) and JDK 17 (openjdk-17-jdk) on the path
const ghidra_install_path = process.env.GHIDRA_INSTALL_PATH;
const analyzeHeadless = path.join(ghidra_install_path, "support", "analyzeHeadless");
const __dirname = import.meta.dirname;
const output_dir = path.join(__dirname, '..', 'projects')
const output_projectname = "testproject" // use the random id of the uploaded file?
// watch out for user defined names passing into arguments
const input_filename = path.join("c:\\", "temp", "ascii.txt") // pass in from uploads
const scripts_path = path.join(__dirname, '..', 'scripts')
const output_symbol_filename =  "symbols.json"
const output_instructions_filename = ""
const output_decomp_filename = ""

// credit to https://ben.page/node-spawn-callback for reference on making a callback with spawn
export const analyze_ghidra = (file_to_analyze: string) =>
  new Promise<void>((resolve) => {
  const args = [output_dir, output_projectname,
    '-import', file_to_analyze,
    "-scriptPath", scripts_path,
    "-postScript", "ExportSymbolInfoScript.java", file_to_analyze + output_symbol_filename,
    // add more postScripts for each script here
    "-deleteProject"]
  const command = spawn(analyzeHeadless, args, {shell: process.platform == 'win32'});
  command.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  command.on("close", () => resolve());
});

// if an error happens like being unable to load the input file, the process will still exit
// check for existence of relevant files after usage