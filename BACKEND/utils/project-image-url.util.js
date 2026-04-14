const path = require("path");

const buildStoredImagePath = (filename) => {
  if (!filename) return null;
  const normalized = filename.split(path.sep).join("/");
  return `/uploads/projects/${normalized}`;
};

module.exports = { buildStoredImagePath };
