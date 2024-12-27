// const express = require("express");
// const cors = require("cors");
// const path = require("path");

// const generateSummaryRouter = require("./routes/generateSummary");

// const app = express();
// const port = 3000;

// // Enable CORS for frontend communication
// app.use(cors());
// app.use(express.json()); // Required for parsing JSON request bodies
// app.use(express.static(path.join(__dirname, "public")));

// // Routes
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// app.get("/customer", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "customer.html"));
// });

// // Use the generate summary route
// app.use("/generate-summary", generateSummaryRouter);

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
const express = require("express");
const cors = require("cors");
const path = require("path");

const generateSummaryRouter = require("./routes/generateSummary");
const generateSuggestionsRouter = require("./routes/generateSuggestions");

const app = express();
const port = 3000;

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json()); // Required for parsing JSON request bodies
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/customer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "customer.html"));
});
app.get("/service-provider", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "service_provider.html"));
});
app.get("/carvan1", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "carvan1.html"));
});

// Use the generate summary route
app.use("/generate-summary", generateSummaryRouter);
app.use("/generate-suggestions", generateSuggestionsRouter);
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});