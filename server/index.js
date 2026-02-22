const express = require("express");
const multer = require("multer");

const app = express();

// Use memory storage (spike; for production environments, disk/object storage is recommended).
const upload = multer({ storage: multer.memoryStorage() });

// In-memory cache of the latest submitted message.
const latestMessage = {
  text: "",
  image: null,
};

// receive multipart/form-data：text + image
app.post("/api/message", upload.single("image"), (req, res) => {
  const text = req.body.text || "";
  const file = req.file || null;

  console.log("text:", text);
  if (file) {
    console.log("image:", file.originalname, file.mimetype, file.size);
  }

  latestMessage.text = text;
  latestMessage.image = file
    ? {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        dataUrl: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      }
    : null;

  res.json({
    ok: true,
    receivedText: latestMessage.text,
    receivedImage: latestMessage.image,
  });
});

//TODO: Get Method: sent the text+image back to client asked.
app.get("/api/msg", (req, res) => {
  res.json({
    ok: true,
    text: latestMessage.text,
    image: latestMessage.image,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
