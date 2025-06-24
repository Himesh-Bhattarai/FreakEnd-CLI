
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


const app = express();
app.use(express.json());


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log('Server running')))
    .catch(err => console.error(err));
