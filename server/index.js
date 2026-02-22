const express = require("express");
const multer = require("multer");

const app = express();

// Use memory storage (spike; for production environments, disk/object storage is recommended).
const upload = multer({ storage: multer.memoryStorage() });


// receive multipart/form-data：text + image
app.post("/api/message", upload.single("image"), (req, res) => {
  const text = req.body.text || "";
  const file = req.file || null;

  console.log("text:", text);
  if (file) {
    console.log("image:", file.originalname, file.mimetype, file.size);
  }

  res.json({
    ok: true,
    receivedText: text,
    receivedImage: file
      ? { name: file.originalname, type: file.mimetype, size: file.size }
      : null,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});