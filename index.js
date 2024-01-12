const axios = require('axios');
const fs = require('fs');

async function getAccessToken(clientId, clientSecret) {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

async function getPlaylistTracks(accessToken, playlistId) {
  const response = await axios.get(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.items;
}

async function getTrackDetails(trackId, accessToken) {
  const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const track = response.data;

  return {
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    link: track.external_urls.spotify,
    duration: track.duration_ms,
    image: track.album.images.length > 0 ? track.album.images[0].url : null,
  };
}

async function getPlaylistDetails(clientId, clientSecret, playlistId) {
  try {
    const accessToken = await getAccessToken(clientId, clientSecret);
    const tracks = await getPlaylistTracks(accessToken, playlistId);

    const playlistDetails = await Promise.all(
      tracks.map(async (track) => {
        const trackDetails = await getTrackDetails(track.track.id, accessToken);
        return trackDetails;
      })
    );

    console.log(playlistDetails);
  } catch (error) {
    console.error('Erro ao obter detalhes da playlist:', error.message);
  }
}

fs.readFile('.json', 'utf8', (error, data) => {
    if (error) {
      console.error('Erro ao ler o arquivo JSON:', error);
      return;
    }
  
    const jsonData = JSON.parse(data);
  
    const clientId = jsonData.clientId;
    const clientSecret = jsonData.clientSecret;
    const playlistId = jsonData.playlistId;

    getPlaylistDetails(clientId, clientSecret, playlistId);

});