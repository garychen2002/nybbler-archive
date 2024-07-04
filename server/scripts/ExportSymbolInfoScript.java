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
// List symbol names/location/type/source to a file in JSON format
// Based on ExportFunctionInfoScript.java included in ghidra 
//@category Functions

import java.io.File;
import java.io.FileWriter;

import com.google.gson.*;
import com.google.gson.stream.JsonWriter;

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.*;
import ghidra.program.model.symbol.*;
import ghidra.program.util.ProgramLocation;


public class ExportSymbolInfoScript extends GhidraScript {

	private static final String NAME = "name";
	private static final String TYPE = "type";
	private static final String ADDRESS = "address";
	private static final String LOCATION = "location";
	private static final String NAMESPACE = "namespace";
	private static final String SOURCE = "source";


	@Override
	public void run() throws Exception {

		Gson gson = new GsonBuilder().setPrettyPrinting().create();

		File outputFile = new File(getScriptArgs()[0]);
		JsonWriter jsonWriter = new JsonWriter(new FileWriter(outputFile));
		jsonWriter.beginArray();

		// Listing listing = currentProgram.getListing();
		SymbolTable symbols = currentProgram.getSymbolTable();
		// FunctionIterator iter = listing.getFunctions(true);
		SymbolIterator iter = symbols.getAllSymbols(true);
		while (iter.hasNext() && !monitor.isCancelled()) {
			// Function f = iter.next();
			Symbol s = iter.next();

			String name = s.getName();
			Address address = s.getAddress();
			String type = SymbolUtilities.getSymbolTypeDisplayName(s);
			// ProgramLocation location = s.getProgramLocation();
			Namespace namespace = s.getParentNamespace();
			SourceType source = s.getSource();

			JsonObject json = new JsonObject();
			json.addProperty(NAME, name);
			json.addProperty(ADDRESS, address.toString());
			json.addProperty(TYPE, type);
			// json.addProperty(LOCATION, location.toString());
			json.addProperty(NAMESPACE, namespace.toString());
			json.addProperty(SOURCE, source.toString());


			gson.toJson(json, jsonWriter);
		}

		jsonWriter.endArray();
		jsonWriter.close();

		println("Wrote functions to " + outputFile);
	}
}
