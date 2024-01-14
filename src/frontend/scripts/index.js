async function getDataApi() {
  let playlist = await fetch("http://localhost:3000/api/get")
    .then(response => response.json())
    .then(data => {return data})
    .catch(error => console.error('Erro na requisição:', error));

  return playlist
}

try {
    const playlist = getDataApi()
    
    // console.log(playlist().then((res) => {res})    
    if (playlist && playlist.tracks) {
      let track = playlist.tracks[0];
      console.log(track.image);
      
      let tracksBox = document.querySelector('div#tracks-container');
      tracksBox.innerHTML += `<div class="track"><img src="${track.image}"></div>`;
    } else {
      console.error('Dados da playlist ou faixas não encontrados.');
    }
  } catch (error) {
    console.error('Erro ao obter detalhes da playlist:', error.message);
  }

// let playlistDetails = getTracks()
// let track = playlistDetails.tracks[0]
// console.log(track.image)
// let tracksBox = document.querySelector('div.tracks-container')
// tracksBox.innerHtml += `<div class="track"><img src="${track.image}"></div>`