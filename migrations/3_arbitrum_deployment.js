const fakeDai = artifacts.require("FakeDai");
const fakeUSDC = artifacts.require("FakeUSDC");
const uniFactory = artifacts.require("UniswapV2Factory");
const uniPair = artifacts.require("UniswapV2Pair");


module.exports = async (deployer, network, addresses) => {
    
    if(network == "kovan") {
        return;
    }
    
    if(network == "arbitrum") {
        
        const fakeDAIaddress = fakeDai.networks["42"].address;
        const fakeUSDCaddress = fakeUSDC.networks["42"].address;

        // N.B: contracts were automatically deployed by Arbitrum when deposits were made from Kovan to the testnet
        const FAKEDAI = new web3.eth.Contract(fakeDai.abi, fakeDAIaddress);
        const FAKEUSDC = new web3.eth.Contract(fakeUSDC.abi, fakeUSDCaddress);

        console.log("Contracts instantiated")
        console.log(`fakeDAI token contract address : ${fakeDAIaddress}`);
        console.log(`fakeUSDC token contract address : ${fakeUSDCaddress}`);

        const fDAIbalance = await FAKEDAI.methods.balanceOf(addresses[0]).call();
        const fUSDCbalance = await FAKEUSDC.methods.balanceOf(addresses[0]).call();

        console.log(`fakeDAI balance: ${fDAIbalance}`);
        console.log(`fakeUSDC balance: ${fUSDCbalance}`);
        
        await deployer.deploy(uniFactory, addresses[0]);
        const FACTORY = await uniFactory.deployed();
        
        await FACTORY.createPair(fakeDAIaddress, fakeUSDCaddress, {gas: 100000000});
        console.log("Pair created");
        
        const pairAddress = await FACTORY.getPair(fakeDAIaddress, fakeUSDCaddress);

        console.log(`Pair address: ${pairAddress}`);

        await FAKEDAI.methods.transfer(pairAddress, web3.utils.toWei("1000000")).send({from: addresses[0]});
        await FAKEUSDC.methods.transfer(pairAddress, web3.utils.toWei("1000000")).send({from: addresses[0]});

        console.log("Tokens transferred to Pair");

        const UNIPAIR = await uniPair.at(pairAddress);
        
        await UNIPAIR.mint(addresses[0]);

        console.log(`LP tokens minted`);
        
    } 

  };