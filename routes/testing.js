var axios = require('axios');

async function testing() {
    const response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + 'AAPL' + '&token=br1ie2frh5reisn53n3g');
    console.log(response.data);
};

testing()