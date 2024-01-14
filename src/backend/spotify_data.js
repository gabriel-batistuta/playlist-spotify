const axios = require('axios');
const fs = require('fs')
const dotenv = require('dotenv');

const envFileContent = fs.readFileSync('.env', 'utf-8');
const envConfig = dotenv.parse(envFileContent);

for (const key in envConfig) {
  process.env[key] = envConfig[key];
}

async function getTracks() {
  const clientId = process.env.clientId;
  const clientSecret = process.env.clientSecret;
  const playlistId = process.env.playlistId;

  // for not use the API to many times
  const playlist = getPlaylistDetails(clientId, clientSecret, playlistId);
  const jsonString = JSON.stringify(playlist, null, 4);
  fs.writeFileSync(".json", jsonString);
}

// getTracks();

async function getAccessToken(clientId, clientSecret) {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    );

    // console.log(response.data.access_token);
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.message);
  }
}

async function getPlaylistDetails(clientId, clientSecret, playlistId) {
  try {
    const accessToken = await getAccessToken(clientId, clientSecret);

    const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!playlistResponse.status === 200) {
      throw new Error(
        `Error in playlist request: ${playlistResponse.status} - ${playlistResponse.statusText}`
      );
    }

    const playlist = playlistResponse.data;
    const playlistName = playlist.name;
    const playlistLink = playlist.external_urls.spotify;

    const tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!tracksResponse.status === 200) {
      throw new Error(
        `Error in tracks request: ${tracksResponse.status} - ${tracksResponse.statusText}`
      );
    }

    const tracks = tracksResponse.data;
    // console.log(tracks);

    const playlistDetails = await Promise.all(
      tracks.items.map(async (trackItem) => {
        const trackDetails = await getTrackDetails(trackItem.track.id, accessToken);
        // console.log(trackDetails);
        return trackDetails;
      })
    );

    // console.log(playlistDetails);
    // console.log('Playlist Name:', playlistName);
    // console.log('Playlist Link:', playlistLink);
    // console.log('Playlist Details:', playlistDetails);

    return {
      name: playlistName,
      link: playlistLink,
      tracks: playlistDetails,
    };
  } catch (error) {
    console.error('Error getting playlist details:', error.message);
  }
}

async function getTrackDetails(trackId, accessToken) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Retry-After": 2
      },
    });

    if (!response.status === 200) {
      throw new Error(`Error in track request: ${response.status} - ${response.statusText}`);
    }

    const track = response.data;
    // console.log(track);
    // console.log(Object.keys(track));

    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: track.album.name,
      link: track.external_urls.spotify,
      duration: track.duration_ms,
      image: track.album.images.length > 0 ? track.album.images[0].url : null,
    };
  } catch (error) {
    console.error('Error getting track details:', error.message);
  }
}

module.exports.getTracks = getTracks;