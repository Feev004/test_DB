const express = require("express");
const app = express();
const pool = require("./DB");
const PORT = 3000;

app.use(express.json());

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ช่วงเวลา 15 นาที
  max: 100 // จำกัด 100 คำขอต่อ IP ในช่วงเวลานี้
});

app.use("/api/", limiter);

app.get("/api/products", async (req, res) => {
  try {
    const sql =
      "SELECT products.id, products.name, products.price, categories.name AS category_name " +
      "FROM products JOIN categories ON products.category_id = categories.id";
    const [products] = await pool.query(sql);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function render(request, response) {
  let url = request.url;
  url = url.endsWith("/") ? url : url + "/";
  let fileName = "public/";
    switch (url) {
    case "/":
      fileName += "index.html";
        break;
    }
  response.sendFile(__dirname + "/" + fileName);
}
app.get("/", render);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));