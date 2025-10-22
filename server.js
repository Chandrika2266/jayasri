const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json()); // for parsing JSON request bodies

const FILE_PATH = "./books.json";

// Helper function to read file
function readBooks() {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading books.json:", err);
    return [];
  }
}

// Helper function to write file
function writeBooks(books) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(books, null, 2));
  } catch (err) {
    console.error("Error writing books.json:", err);
  }
}

// GET /books - return all books
app.get("/books", (req, res) => {
  const books = readBooks();
  res.json(books);
});

// GET /books/available - return only available books
app.get("/books/available", (req, res) => {
  const books = readBooks();
  const availableBooks = books.filter(b => b.available === true);
  res.json(availableBooks);
});

// POST /books - add a new book
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

// PUT /books/:id - update a book
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

// DELETE /books/:id - delete a book
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
