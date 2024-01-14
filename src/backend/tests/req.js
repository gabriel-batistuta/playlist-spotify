const axios = require('axios')

axios.get('http://localhost:3000/api/get')
  .then(
    (response) => {
      console.log(response.data)
    }
    ).catch(
      error => console.error('Erro ao obter dados:', error)
      );
