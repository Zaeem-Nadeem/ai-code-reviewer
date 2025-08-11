require("dotenv").config();
const app = require("./src/app.js");

// Add this line to verify the API key is loaded
console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "Yes" : "No");

app.listen(3000, () => {
  console.log("Server is running at Port: 3000");
});
