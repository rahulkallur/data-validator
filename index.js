const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const aes = require("aes-js");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const BLOCK_SIZE = process.env.BLOCK_SIZE; // AES block size in bytes

const removePadding = (data) => {
  const padding = data[data.length - 1];
  return data.slice(0, data.length - padding);
};

const decryptData = (encryptedHex) => {
  try {
    // Convert key to bytes
    const keyBytes = aes.utils.utf8.toBytes(ENCRYPTION_KEY);

    // Convert hex to bytes
    const encryptedBytes = aes.utils.hex.toBytes(encryptedHex);

    // Create CTR instance with key
    const aesCtr = new aes.ModeOfOperation.ctr(keyBytes);

    // Decrypt
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Remove padding
    const unpaddedBytes = removePadding(decryptedBytes);

    // Convert bytes back to text
    const decryptedText = aes.utils.utf8.fromBytes(unpaddedBytes);

    return JSON.parse(decryptedText);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/decrypt", (req, res) => {
  const { encryptedText } = req.body;
  if (!encryptedText) {
    return res.status(400).json({ error: "Encrypted text is required." });
  }
  const decryptedText = decryptData(encryptedText);
  console.log(decryptedText);
  res.json({ decryptedText });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
