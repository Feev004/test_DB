const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
// const http = require("http");

const PORT = 3000;

app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: "Keyboard", price: 2500 },
  { id: 2, name: "Mouse", price: 1500 },
  { id: 3, name: "Monitor", price: 7500 },
];

app.get("/products", (req, res) => {
  res.status(200).json(products);
});

app.post("/products", (req, res) => {
  const newProduct = req.body;
  newProduct.id = products.length + 1;
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.status(200).json({ message: "Product deleted successfully." });
  } else {
    res.status(404).json({ message: "Product not found." });
  }
});
app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index].name = req.body.name;
    products[index].price = req.body.price;
    res.json(products[index]);
  } else {
    res.status(404).send("ไม่พบสินค้าที่ต้องการแก้ไข");
  }
});

function render(request, response) {
  let url = request.url;
  url = url.endsWith("/") ? url : url + "/";
  let fileName = "view/";
  switch (url) {
    case "/":
      fileName += "index.html";
      break;
  }
  fs.readFile(fileName, (error, content) => {
    let ctype = { "Content-Type": "text/html" };
    if (!error) {
      response.writeHead(200, ctype);
      response.write(content);
    } else {
      response.writeHead(404, ctype);
      response.write(error.message);
    }
    return response.end();
  });
}

app.get("/", render); // รันหน้าแรก (index.html) จาก function render(request, response)
app.listen(PORT, () => {
  console.log(`Server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});

// http.createServer(render).listen(PORT);
// console.log(`Server started on http://localhost:${PORT}/\nPress <Ctrl + C> to stop`);
