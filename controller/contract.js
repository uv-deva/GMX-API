const ethers = require('ethers');
require('dotenv').config();
const abi = require('../abi/priceFeed.json');
const tokens = require('./tokenList.json')
const axios = require('axios');

const { INFURA_URL, PRIVATE_KEY, CONTRACT_ADDRESS, SUBGRAPH_API_URLS } = process.env;

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const priceCandleQuery = `
  query GetPriceCandles($first: Int, $period: String) {
    priceCandles(first: $first, where: { period: $period }) {
      id
      token
      open
      high
      low
      close
      timestamp
      period
    }
  }
`;

async function fetchGraphQL(endpoint, query, variables = {}) {
    // const headers = {
    //   'Content-Type': 'application/json',
    // };
    try {
      const response = await axios.post(endpoint, {
        query,
        variables,
      });
  
    //   console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error calling GraphQL API:', error);
    }
  }

const getTickers = async () => {
    try {
        let price= [];
        for(let i = 0; i < tokens.length; i++) {
            let tokenAddress = await contract.tokens(i);
            let priceFeed = await contract.prices(tokenAddress);
            let amount = (parseInt(priceFeed)/10**30);
            let tokenData = await contract.tokenPriceData(tokenAddress);
            price.push({
                "tokenAddress": tokenAddress,
                "tokenSymbol": tokenData[0],
                "price": amount.toLocaleString('fullwide', {useGrouping:false}),
                "minPrice": (parseInt(tokenData[1]).toLocaleString('fullwide', {useGrouping:false}))/10**18,
                "maxPrice": (parseInt(tokenData[2]).toLocaleString('fullwide', {useGrouping:false}))/10**18,
                "updatedAt": parseInt(tokenData[3]).toLocaleString('fullwide', {useGrouping:false}),
                "timestamp": parseInt(tokenData[4]).toLocaleString('fullwide', {useGrouping:false})
                });
        }
        return {
            price
        };
    } catch (error) {
        throw new Error(`Error fetching token details: ${error.message}`);
    }
};
        
const get24hData = async (limit) => {
    try {
        let candlesData = [];
        const endpoint = SUBGRAPH_API_URLS;
        const data = await fetchGraphQL(endpoint, priceCandleQuery, { first: parseInt(limit), period: "1d" })
        for(let i = 0; i < data.data.priceCandles.length; i++) {
            let tokenData = await contract.tokenPriceData(data.data.priceCandles[i].token);
            candlesData.push({
                "tokenSymbol": tokenData[0],
                "high": data.data.priceCandles[i].high,
                "low": data.data.priceCandles[i].low,
                "open": data.data.priceCandles[i].open,
                "close": data.data.priceCandles[i].close
            })
        }
        console.log(candlesData)
        return candlesData;
    } catch (error) {
        throw new Error(`Error fetching token details: ${error.message}`);
    }
};

const getCandles = async (limit, period) => {
    try {
        let candlesData = [];
        const endpoint = SUBGRAPH_API_URLS;
        const data = await fetchGraphQL(endpoint, priceCandleQuery, { first: parseInt(limit), period })
        for(let i = 0; i < limit; i++) {
            candlesData.push({
                'period': period,
                "candles": [[
                    data.data.priceCandles[i].timestamp,
                    data.data.priceCandles[i].open,
                    data.data.priceCandles[i].high,
                    data.data.priceCandles[i].low,
                    data.data.priceCandles[i].close
                ]]
            })
        }
        return candlesData;
    } catch (error) {
        throw new Error(`Error fetching token details: ${error.message}`);
    }
};

const getIncentives = async () => {
    try {

    } catch (error) {
        throw new Error(`Error fetching token details: ${error.message}`);
    }
};

module.exports = {
    getTickers, get24hData, getCandles, getIncentives
};