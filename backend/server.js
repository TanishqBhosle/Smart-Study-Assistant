require('dotenv').config()
const express = require('express');
const cors=require('cors');
const app = express();
const port = 5000;
app.use(express.json())
app.use(cors())
const studyRoute=require('./routes/study');

app.use('/study',studyRoute);

app.get('/', (req, res) => {
    res.send('✅ Backend is running fine!');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});