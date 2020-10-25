Arbitrum test for depositing ERC-tokens, deploying a Uniswap pool and doing a swap :

PRE-REQUISITES:
- truffle
- an Ethereum mnemonic seed with at least two accounts containing kovanETH
- a working Infura API key

Steps :
- download/clone repo
- npm install
- create an .env file that declares the MNEMONIC variable and the INFURA_URL variable (linking to the Kovan testnet)
- truffle deploy --network kovan --skip-dry-run
- truffle deploy --network arbitrum --skip-dry-run
- node swap-script.js
