const express = require('express');
const app = express();
const PORT = 3000;
const spotify = require('./spotify_data')
const cors = require('cors');
const fs = require('fs')

app.use(cors());
// Middleware para mostrar logs para todas as solicitações
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(express.json());

app.get('/api/get', async (req, res) => {
//   const playlistDetails = await spotify.getTracks()
// for not use the API to many times
  let playlistDetails = fs.readFileSync(".json", 'utf-8');
  playlistDetails = JSON.parse(playlistDetails);
  res.json(playlistDetails);
});

app.post('/api/post', (req, res) => {
  const requestData = req.body;
  const responseObject = {null:null}
  res.json(responseObject);
});

app.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
});
