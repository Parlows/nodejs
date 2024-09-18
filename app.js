const express = require('express');
const app = express();

app.use(express.static('public'));

const queryRouter = require('./routes/query')
app.use('/query', queryRouter);
const streaming = require('./routes/streaming')
app.use('/video', streaming)

app.listen(3000, () => {
    console.log('Server running in port 3000')
});

