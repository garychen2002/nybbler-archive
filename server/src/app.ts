import bodyParser from "body-parser";
import express from "express";

export const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.listen(PORT, () => {
  console.log(`HTTP server on port ${PORT}`);
});
