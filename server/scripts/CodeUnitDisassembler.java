/* ###
 * IP: GHIDRA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Output raw disassembled instructions
// Based on ExportFunctionInfoScript.java included in ghidra 
// tips from https://github.com/NationalSecurityAgency/ghidra/issues/2099
//@category Functions

import java.io.File;
import java.io.FileWriter;

import com.google.gson.*;
import com.google.gson.stream.JsonWriter;

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.*;
import ghidra.program.model.symbol.*;


public class CodeUnitDisassembler extends GhidraScript {

	private static final String INSTRUCTION = "instruction";
	private static final String ADDRESS = "address";



	@Override
	public void run() throws Exception {

		Gson gson = new GsonBuilder().setPrettyPrinting().create();

		File outputFile = new File(getScriptArgs()[0]);
		JsonWriter jsonWriter = new JsonWriter(new FileWriter(outputFile));
		jsonWriter.beginArray();

		Listing listing = currentProgram.getListing();
		// InstructionIterator iter = listing.getInstructions(true);
		CodeUnitIterator iter = listing.getCodeUnits(true);
		// CodeUnits include all data?

		while (iter.hasNext() && !monitor.isCancelled()) {
			// Function f = iter.next();
			// Symbol s = iter.next();
			CodeUnit c = iter.next();
			// Instruction i = iter.next();

			String name = c.toString();
			Address address = c.getAddress();

			JsonObject json = new JsonObject();
			json.addProperty(INSTRUCTION, name);
			json.addProperty(ADDRESS, address.toString());



			gson.toJson(json, jsonWriter);
		}

		jsonWriter.endArray();
		jsonWriter.close();

		println("Wrote functions to " + outputFile);
	}
}
