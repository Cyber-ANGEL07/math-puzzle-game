const express = require('express')
const app = express
const PORT = 3000;

app.use(express.json);

// ---- ADD THIS ABOVE app.get ----
function decodeHtml(str) {
    if (!str) return str;
  
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }
 
app.get('/', (req, res) => {
    res.send('Backend is running')
});

app.listen(PORT, () => {
    console.log('Server Running on Port ${PORT}');

});