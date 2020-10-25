const fakeDai = artifacts.require("FakeDai");
const fakeUSDC = artifacts.require("FakeUSDC");
const IGlobalInbox = artifacts.require("IGlobalInbox");

module.exports = async (deployer, network) => {

    if(network == "arbitrum") {
        return;
    }

    if(network == "kovan") {
        await deployer.deploy(fakeDai);
        await deployer.deploy(fakeUSDC);

        const FAKEDAI = await fakeDai.deployed();
        const FAKEUSDC = await fakeUSDC.deployed();

        console.log(FAKEDAI.address);
        console.log(FAKEUSDC.address);

        const GLOBALINBOX = new web3.eth.Contract(IGlobalInbox.abi, "0xE681857DEfE8b454244e701BA63EfAa078d7eA85");
        
        await FAKEDAI.approve("0xE681857DEfE8b454244e701BA63EfAa078d7eA85", web3.utils.toWei("100000000"));
        await FAKEUSDC.approve("0xE681857DEfE8b454244e701BA63EfAa078d7eA85", web3.utils.toWei("100000000"));

        console.log("Token approvals confirmed");

        await GLOBALINBOX.methods.depositERC20Message("0x175c0b09453cbb44fb7f56ba5638c43427aa6a85", FAKEDAI.address, "0x0C3f4185AaecD498cfd51B3d683C2C46d301b2F7", web3.utils.toWei("100000000")).send({from: "0x0C3f4185AaecD498cfd51B3d683C2C46d301b2F7"});
        await GLOBALINBOX.methods.depositERC20Message("0x175c0b09453cbb44fb7f56ba5638c43427aa6a85", FAKEUSDC.address, "0x0C3f4185AaecD498cfd51B3d683C2C46d301b2F7", web3.utils.toWei("100000000")).send({from: "0x0C3f4185AaecD498cfd51B3d683C2C46d301b2F7"});

        console.log("Tokens deposited into rollup");

    } 

  };