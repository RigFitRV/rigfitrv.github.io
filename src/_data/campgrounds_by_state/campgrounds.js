const fs = require("fs");
const path = require("path");

module.exports = function () {
  const stateDir = path.join(__dirname, "campgrounds_by_state");
  if (!fs.existsSync(stateDir)) return [];

  const files = fs.readdirSync(stateDir).filter((file) => file.endsWith(".json"));
  let allCampgrounds = [];

  for (const file of files) {
    const filePath = path.join(stateDir, file);
    const rawData = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      allCampgrounds = allCampgrounds.concat(parsed);
    }
  }

  return allCampgrounds;
};
