const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "src", "pages", "blog", "departements");

fs.readdirSync(dir).forEach((file) => {
  if (file.endsWith(".html")) {
    const filePath = path.join(dir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        let html = data.choices[0].message.content;
        html = html.replace(/^```html\s*/, "").replace(/\s*```$/, "");
        fs.writeFileSync(filePath, html, "utf8");
        console.log("Fixed", file);
      }
    } catch (e) {
      // already HTML
    }
  }
});
