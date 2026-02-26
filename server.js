const express = require("express");
const app = express();
const multer = require("multer");
const pool = require("./DB");
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/products", async (req, res) => {
  try {
    const sql =
      "SELECT products.id, products.name, products.price, products.image_url, categories.name AS category_name " +
      "FROM products JOIN categories ON products.category_id = categories.id";
    const [products] = await pool.query(sql);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const storage = multer.diskStorage({
  destination: "./public/images/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    const image_url = req.file
      ? `/images/${req.file.filename}`
      : "/images/no-image.png";

    const sql = `INSERT INTO products (name, price, image_url, category_id) VALUES (?, ?, ?, ?)`;
    await pool.query(sql, [name, price, image_url, category_id]);

    res.json({ message: "อัปโหลดและบันทึกสําเร็จ!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id; // รับค่า ID จาก URL
  const sql = "DELETE FROM products WHERE id = ?";

  pool.query(sql, [productId], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send({ message: "Product deleted successfully" });
  });
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

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
