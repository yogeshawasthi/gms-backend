const express = require('express');
const app = express();


const PORT =4000;


require('./DBConn/conn.js');

app.get('/', (req, res) => {
  res.send({"message": "congrats your server is running on port 4000 successfully"});
})


app.listen(PORT, () => {
    console.log("Server is running on Port 4000")

    })
