const ethers = require('ethers');
require('dotenv').config();
const abi = require('../abi/priceFeed.json');
const tokens = require('./tokenList.json')

const { INFURA_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const getTokenDetails = async () => {
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

module.exports = {
    getTokenDetails
};