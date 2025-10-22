const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;
app.use(express.json()); 

const FILE_PATH = "./books.json";
function readBooks() {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading books.json:", err);
    return [];
  }
}
function writeBooks(books) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2));
  } catch (err) {
    console.error("Error writing books.json:", err);
  }
}
app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});
app.get("/books/available", (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(b => b.available === true);
  res.json(availableBooks);
});
app.post("/books", (req, res) => {
  const books = readBooks();
  const { title, author, available } = req.body;

  if (!title || !author || typeof available !== "boolean") {
    return res.status(400).json({ error: "Invalid book data" });
  }

  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author,
    available
  };

  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});
app.put("/books/:id", (req, res) => {
  const books = readBooks();
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: "Book not found" });
  }

  const { title, author, available } = req.body;

  if (title !== undefined) books[bookIndex].title = title;
  if (author !== undefined) books[bookIndex].author = author;
  if (available !== undefined) books[bookIndex].available = available;

  writeBooks(books);
  res.json(books[bookIndex]);
});
app.delete("/books/:id", (req, res) => {
  const books = readBooks();
  const bookId = parseInt(req.params.id);
  const updatedBooks = books.filter(b => b.id !== bookId);

  if (updatedBooks.length === books.length) {
    return res.status(404).json({ error: "Book not found" });
  }

  writeBooks(updatedBooks);
  res.json({ message: "Book deleted successfully" });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${8080}`);
});
