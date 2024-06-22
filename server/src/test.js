import { exec, spawn } from "child_process";
import * as path from 'path';

// env
// requires both a Ghidra install and JDK 17 (openjdk-17-jdk) on the path
const ghidra_install_path = process.env.GHIDRA_INSTALL_PATH
// "C:\\Users\\Gary\\Downloads\\ghidra_11.0_PUBLIC_20231222\\ghidra_11.0_PUBLIC"
const analyzeHeadless = path.join(ghidra_install_path, "support", "analyzeHeadless");
const __dirname = import.meta.dirname;
const output_dir = path.join(__dirname, '..', 'projects')
const output_projectname = "testproject" // use the random id of the uploaded file?
// watch out for user defined names since passing into arguments
const input_filename = path.join("c:\\", "temp", "ex1.exe") // pass in from uploads
const scripts_path = path.join(__dirname, '..', 'scripts')
const output_symbol_filename =  "symbols.json"
const output_instructions_filename = ""
const output_decomp_filename = ""
const args = [output_dir, output_projectname,
            '-import', input_filename,
            "-scriptPath", scripts_path,
            "-postScript", "ExportSymbolInfoScript.java", output_symbol_filename,
            // add more postScripts here
            "-deleteProject"]

console.log(output_dir)
console.log(input_filename)


const h = spawn(analyzeHeadless, args, {shell: process.platform == 'win32'});

h.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

h.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
h.on('error', (err) => {
  console.log('error', err);
});
h.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

// exec(analyzeHeadless, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.error(`stderr: ${stderr}`);
//     return;
//   }

//   console.log(`stdout:\n${stdout}`);
// });