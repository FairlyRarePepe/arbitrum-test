const fakeDai = artifacts.require("FakeDai");
const fakeUSDC = artifacts.require("FakeUSDC");
const IGlobalInbox = artifacts.require("IGlobalInbox");

module.exports = async (deployer, network, addresses) => {

    if(network == "arbitrum") {
        return;
    }

    if(network == "kovan") {
        await deployer.deploy(fakeDai);
        await deployer.deploy(fakeUSDC);

        const FAKEDAI = await fakeDai.deployed();
        const FAKEUSDC = await fakeUSDC.deployed();

        console.log(`fakeDAI token contract address : ${FAKEDAI.address}`);
        console.log(`fakeUSDC token contract address : ${FAKEUSDC.address}`);

        const globalInboxAddress = "0xE681857DEfE8b454244e701BA63EfAa078d7eA85";
        const arbChainAddress = "0x175c0b09453cbb44fb7f56ba5638c43427aa6a85";

        const GLOBALINBOX = new web3.eth.Contract(IGlobalInbox.abi, globalInboxAddress);
        
        await FAKEDAI.approve(globalInboxAddress, web3.utils.toWei("100000000"));
        await FAKEUSDC.approve(globalInboxAddress, web3.utils.toWei("100000000"));

        console.log("Token approvals confirmed");

        await GLOBALINBOX.methods.depositERC20Message(arbChainAddress, FAKEDAI.address, addresses[0], web3.utils.toWei("100000000")).send({from: addresses[0]});
        await GLOBALINBOX.methods.depositERC20Message(arbChainAddress, FAKEUSDC.address, addresses[0], web3.utils.toWei("100000000")).send({from: addresses[0]});

        console.log("Tokens deposited into rollup");

    } 

  };