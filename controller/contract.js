const ethers = require('ethers');
require('dotenv').config();
const abi = require('../abi/priceFeed.json');
const tokens = require('./tokenList.json')
const axios = require('axios');

const { INFURA_URL, PRIVATE_KEY, CONTRACT_ADDRESS, SUBGRAPH_API_URLS, SUBGRAPH_INCENTIVE_API_URLS } = process.env;

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

const tradeIncentive = `
    query GetTradeIncentive($first: Int) {
        tradingIncentivesStats(first: $first) {
            id
            timestamp
            period
            positionFeesUsd
            positionFeesInArb
            eligibleFeesInArb
            eligibleFeesUsd
            rebatesCapInArb
        }
    }
`;

const liquidityProviderIncentivesStat = `
    query GetLiquidityProviderIncentivesStat($first: Int){
        liquidityProviderIncentivesStats(first: $first) {
            id
            period
            timestamp
            account
            glvOrMarketAddress
            type
            updatedTimestamp
            lastTokensBalance
            cumulativeTimeByTokensBalance
            weightedAverageTokensBalance
        }
    }
`;

const marketIncentivesStat = `
    query getMarketIncentivesStat($first: Int) {
        incentivesStats(first: $first) {
            id
            period
            timestamp
            glvOrMarketAddress
            type
            updatedTimestamp
            lastTokensSupply
            cumulativeTimeByTokensSupply
            weightedAverageTokensSupply
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
                "high": (parseInt(data.data.priceCandles[i].high)/10**30),
                "low": (parseInt(data.data.priceCandles[i].low)/10**30),
                "open": (parseInt(data.data.priceCandles[i].open)/10**30),
                "close": (parseInt(data.data.priceCandles[i].close)/10**30)
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
                    (parseInt(data.data.priceCandles[i].open)/10**30),
                    (parseInt(data.data.priceCandles[i].high)/10**30),
                    (parseInt(data.data.priceCandles[i].low)/10**30),
                    (parseInt(data.data.priceCandles[i].close)/10**30)
                ]]
            })
        }
        return candlesData;
    } catch (error) {
        throw new Error(`Error fetching token details: ${error.message}`);
    }
};

const getIncentives = async (limit) => {
    try {
        let incentiveData = [];
        const endpoint = SUBGRAPH_INCENTIVE_API_URLS;
        const tradeData = await fetchGraphQL(endpoint, tradeIncentive, { first: parseInt(limit) })
        const lpIncentiveData = await fetchGraphQL(endpoint, liquidityProviderIncentivesStat, { first: parseInt(limit) })
        const marketIncentiveData = await fetchGraphQL(endpoint, marketIncentivesStat, { first: parseInt(limit) })
        
        console.log(tradeData);
        console.log(lpIncentiveData);
        console.log(marketIncentiveData);

        incentiveData.push({
            'lp': {
                isActive: "",
                totalRewards: "",
                totalShare: "",
                token: "",
                period: "",
                excludeHolders: "",
                rewardsPerMarket: ""
            },
            "migration": {
                isActive: ""
            },
            "trading": {
                isActive: ""
            }
        })
    return incentiveData;
    } catch (error) {
        throw new Error(`Error fetching token details: ${error.message}`);
    }
};

module.exports = {
    getTickers, get24hData, getCandles, getIncentives
};