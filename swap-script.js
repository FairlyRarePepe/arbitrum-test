const Web3 = require("web3");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const wrapProvider = require('arb-ethers-web3-bridge').wrapProvider;
const fakeDaiJSON = require("./build/contracts/FakeDai.json");
const fakeUSDCJSON = require("./build/contracts/FakeUSDC.json");
const IGlobalInboxJSON = require("./build/contracts/IGlobalInbox.json");
const IFakeUSDCarbitrumJSON = require("./build/contracts/IfakeUSDCarbitrum.json");
const uniswapV2FactoryJSON = require("./build/contracts/UniswapV2Factory.json");
const uniswapV2PairJSON = require("./build/contracts/UniswapV2Pair.json");

const { BN } = require("ethereumjs-util");

require("dotenv").config();

// kovan provider
const web3kovan = new Web3(new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_URL));
// arbitrum provider
const web3arbitrum = new Web3(wrapProvider(
    new HDWalletProvider(process.env.MNEMONIC, 'https://node.offchainlabs.com:8547')
  ));
  
const init = async () => {

const accounts = await web3kovan.eth.getAccounts();
let owner = accounts[0];
let swapper = accounts[1];
const globalInboxAddress = "0xE681857DEfE8b454244e701BA63EfAa078d7eA85";
const arbChainAddress = "0x175c0b09453cbb44fb7f56ba5638c43427aa6a85";

const fakeDAIaddress = fakeDaiJSON.networks["42"].address;
const FAKEDAIkovan = new web3kovan.eth.Contract(fakeDaiJSON.abi, fakeDAIaddress);

// transfer 5000 DAI to second address

await FAKEDAIkovan.methods.transfer(swapper, web3kovan.utils.toWei("5000")).send({from: owner, gasPrice: 20000000000});
console.log("5000 DAI transferred from owner to swapper");

// deposit DAI into L2

const GLOBALINBOX = new web3kovan.eth.Contract(IGlobalInboxJSON.abi, globalInboxAddress);
await FAKEDAIkovan.methods.approve(globalInboxAddress, web3kovan.utils.toWei("5000")).send({from: swapper, gasPrice: 20000000000});
console.log("Token approval confirmed");
await GLOBALINBOX.methods.depositERC20Message(arbChainAddress, fakeDAIaddress, swapper, web3kovan.utils.toWei("5000")).send({from: swapper});
console.log("DAI Tokens deposited into rollup");

// calculate rates

const fakeUSDCaddress = fakeUSDCJSON.networks["42"].address;
const FAKEUSDC = new web3arbitrum.eth.Contract(fakeUSDCJSON.abi, fakeUSDCaddress);
const FAKEDAIarbitrum = new web3arbitrum.eth.Contract(fakeDaiJSON.abi, fakeDAIaddress);

console.log(fakeDAIaddress);
console.log(fakeUSDCaddress);

const UNIFACTORY = new web3arbitrum.eth.Contract(uniswapV2FactoryJSON.abi, uniswapV2FactoryJSON.networks["215728282823301"].address);
const uniPairAddress = await UNIFACTORY.methods.getPair(fakeDAIaddress, fakeUSDCaddress).call({from: swapper});
const UNIPAIR = new web3arbitrum.eth.Contract(uniswapV2PairJSON.abi, uniPairAddress);
console.log(`Unipair address: ${uniPairAddress}`);

const token0 = await UNIPAIR.methods.token0().call({from: swapper});
const token1 = await UNIPAIR.methods.token1().call({from: swapper});

console.log(`Token0 address: ${token0}`);
console.log(`Token1 address: ${token1}`);

const fakeDaiBalance = await FAKEDAIarbitrum.methods.balanceOf(swapper).call({from: swapper});
console.log(fakeDaiBalance);
console.log(`DAI amount to be swapped : ${web3arbitrum.utils.toWei("5000")}`);

let amountInWithFee = web3arbitrum.utils.toWei("5000");
amountInWithFee = new BN(amountInWithFee);
amountInWithFee = amountInWithFee.mul(new BN(997));

const reserves = await UNIPAIR.methods.getReserves().call({from: swapper});

let reserveIn;
let reserveOut;
if(token0 == fakeDAIaddress) {
    reserveIn = new BN(reserves["0"]);
    reserveOut = new BN(reserves["1"]);
} else if(token0 == fakeUSDCaddress) {
    reserveIn = new BN(reserves["1"]);
    reserveOut = new BN(reserves["0"]);
} else {
    console.log("No address match !");
}

let numerator = amountInWithFee.mul(reserveOut);
let denominator = reserveIn.mul(new BN(1000));
denominator = denominator.add(amountInWithFee);
let amountOut = numerator.div(denominator);
console.log(amountOut);
console.log(`Expected USDC amount to be received : ${web3arbitrum.utils.fromWei(amountOut)}`);

// swap DAI into USDC

await FAKEDAIarbitrum.methods.transfer(uniPairAddress, web3arbitrum.utils.toWei("5000")).send({from: swapper});

console.log("DAI transferred to pool");

if(token0 == fakeDAIaddress) {
    await UNIPAIR.methods.swap(0, amountOut, swapper, []).send({from: swapper});
} else if (token1 == fakeDAIaddress) {
    await UNIPAIR.methods.swap(amountOut, 0, swapper, []).send({from: swapper});
}

console.log("Swap completed");

// check USDC balance

const fakeUSDCbalance = await FAKEUSDC.methods.balanceOf(swapper).call({from: swapper});
console.log(`USDC balance : ${web3arbitrum.utils.fromWei(fakeUSDCbalance)}`);

// withdraw USDC to Kovan
const IFAKEUSDCARBITRUM = new web3arbitrum.eth.Contract(IFakeUSDCarbitrumJSON.abi, fakeUSDCaddress);

await IFAKEUSDCARBITRUM.methods.withdrawERC20(swapper, fakeUSDCbalance).send({from: swapper});
console.log("Withdrawal initiated");

}

init();