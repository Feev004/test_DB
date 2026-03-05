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

app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id; // รับค่า ID จาก URL
    const sql = "DELETE FROM products WHERE id = ?";
    await pool.query(sql, [productId]);
    res.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// app.put("/api/products/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, price, category_id } = req.body;
//     const image_url = req.file
//       ? `/images/${req.file.filename}`
//       : req.body.image_url;

//     const sql = `UPDATE products SET name = ?, price = ?, image_url = ?, category_id = ? WHERE id = ?`;
//     await pool.query(sql, [name, price, image_url, category_id, id]);

//     res.json({ message: "อัปเดตสําเร็จ!" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/api/categories", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories");
  res.json(rows);
});
app.get("/api/products/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id } = req.body;
    let sql, params;

    if (req.file) {
      const image_url = `/images/${req.file.filename}`;
      sql = "UPDATE products SET name=?, price=?, category_id=?, image_url=? WHERE id=?";
      params = [name, price, category_id, image_url, id];
    } else {
      sql = "UPDATE products SET name=?, price=?, category_id=? WHERE id=?";
      params = [name, price, category_id, id];
    }

    await pool.query(sql, params);
    res.json({ message: "Update success" });
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

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
