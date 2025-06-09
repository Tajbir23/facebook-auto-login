const express = require("express");
const multer = require("multer");
const readExcelFile = require("./controller/readExcelFile");
const scrap = require("./controller/scrapping");
const processInBatches = require("./controller/processInBatches");
const { exec } = require("child_process");
const createProxyFile = require("./controller/createProxyFile");
const deleteProxyFile = require("./controller/deleteProxyFile");
const app = express();

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const upload = multer({ dest: "uploads/" })

app.get("/", (req, res) => {
  res.render("index")
});

let successDataMap = new Map()
let errorDataMap = new Map()
app.post("/scrape", upload.single("credentials"), async(req, res) => {
    console.log(req.file?.path)
    const data = await readExcelFile(req.file?.path)
    await deleteProxyFile()
    await createProxyFile("proxy.txt", req.body.data)
    await processInBatches(data, 10, scrap, successDataMap, errorDataMap)
    res.json({successDataMap, errorDataMap})
})
app.listen(3000, () => {
  console.log("Server is running on port 3000");
  const url = "http://localhost:3000"

  exec('wmic bios get serialnumber', (err, stdout, stderr) => {
    if (err) {
      console.error(err)
    } else {
      console.log(stdout)
    }
  })
  switch (process.platform) {
    case "win32":
      exec(`start ${url}`)
      break
    default:
      exec(`open ${url}`)
  }
});
