const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const { fail } = require("./helpers");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1048576, files: 1, fields: 20, fieldSize: 16384 },
});
module.exports = {
  single(field) {
    return [
      upload.single(field),
      async (req, res, next) => {
        try {
          if (!req.file) return next();
          const { buffer, mimetype } = req.file;
          const type = buffer
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            ? "png"
            : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
              ? "jpg"
              : ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString())
                ? "gif"
                : null;
          if (
            !type ||
            mimetype !==
              { png: "image/png", jpg: "image/jpeg", gif: "image/gif" }[type]
          )
            fail(400, "Choose a valid PNG, JPG or GIF image.");
          const dir = path.join(
            process.env.PUBLIC_DIR || path.join(__dirname, "../public"),
            field === "avatar" ? "images" : "coursesImg",
          );
          await fs.mkdir(dir, { recursive: true });
          req.file.filename = randomUUID() + "." + type;
          await fs.writeFile(path.join(dir, req.file.filename), buffer);
          next();
        } catch (error) {
          next(error);
        }
      },
    ];
  },
};
