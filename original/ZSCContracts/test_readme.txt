
[preparation]
1: compile solidity files (.js)
bash bash_multisigwallet.sh
bash bash_multisigtoken.sh
bash bash_token.sh

2: ABIs
solc --abi ./sol/token.js 
solc --abi ./sol/multisigwallet.js 
solc --abi ./sol/multisigtoken.js 


2: load files
loadScript(“./js/contract.js”);
loadScript(“./js/compiled_token.js");
loadScript("./js/compiled_multisigwallet.js");
loadScript("./js/compiled_multisigtoken.js");

3: create contracts
var myToken = ContractToken(0, /*use your account path*/, compiledToken, "./sol/token.js:ZeusShieldCoin");
var myWallet = ContractMultiwallet(0, /*use your account path*/,compiledMultisigwallet, "./sol/multisigwallet.js:ZSCMultiSigWallet");
var myCongress = ContractMultitoken(0, /*use your account path*/,compiledMultisigtoken, "./sol/multisigtoken.js:ZSCMultiSigToken", myToken.address);

4: activiate token: 2074 * 1000 * 1000 * 10**18 zsc allocated to myCongress.address
myToken.registerSale(0x0, myCongress.address, {from:eth.accounts[0], gas:4500000});


[test] use myetherwallet.com for test.
1: zsc token
totalSupply, balanceOf, transfer, transferFrom, approve, freeze, frozenRules

2: multisigwallet
submitTransaction, confirmTransaction

3: multisigtoken
submitTransaction, confirmTransaction


