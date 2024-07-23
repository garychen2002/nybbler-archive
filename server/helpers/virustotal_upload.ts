import { readFile } from "fs/promises";
import virustotal from "node-virustotal";


// https://www.npmjs.com/package/node-virustotal

export const virustotal_upload = async (file_to_analyze: string, filename: string, type: string) => {
    // API limits are strict so this may not work
    console.log("uploading to virustotal")
    const defaultTimedInstance = virustotal.makeAPI();
    const file_to_upload = await readFile(file_to_analyze);
    const theSameObject = defaultTimedInstance.uploadFile(file_to_upload, filename, type, function(err, res) {
    if (err) {
        console.log("virustotal fail (maybe API)")
        console.log(err);
        return;
    }
    console.log("virustotal success")
    console.log(JSON.stringify(res));
    return;
    });
}