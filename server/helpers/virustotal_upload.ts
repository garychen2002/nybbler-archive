import axios from "axios";
import multer from "multer";


export const virustotal_upload = async (file_to_analyze: Express.Multer.File) => {
  // API limits are strict so this may not work consistently
  if (process.env.VIRUSTOTAL_KEY) {
    const form = new FormData();
    form.append('file', new Blob([file_to_analyze.buffer]), file_to_analyze.originalname);

    const response = await axios.post("https://www.virustotal.com/api/v3/files", form, {
        headers: {
          accept: "application/json",
          'x-apikey': process.env.VIRUSTOTAL_KEY,
        },
      }).then((res) => {
        console.log("VIRUSTOTAL SUCCESS")
        return res.data;
      })
      .catch(error => {
        console.log("VIRUSTOTAL ERROR")
        console.log(error.response.data)
      });
    return response;
  } else {
    console.log("key not provided");
    return;
  }
};
