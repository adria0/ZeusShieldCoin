
[preparation]
1: compile solidity files (.js)
bash bash_multisigwallet.sh
bash bash_multisigtoken.sh
bash bash_token.sh
bash bash_icofactory.js

2: ABIs
solc --abi ./sol/token.js 
solc --abi ./sol/icofactory.js 
solc --abi ./sol/multisigwallet.js 
solc --abi ./sol/multisigtoken.js 


2: load files
loadScript(“./js/contract.js”);
loadScript(“./js/compiled_icofactory.js”);
loadScript(“./js/compiled_token.js");
loadScript("./js/compiled_multisigwallet.js");
loadScript("./js/compiled_multisigtoken.js");

3: create contracts
var myToken = ContractToken(0, /*use your account pass*/, compiledToken, "./sol/token.js:ZeusShieldCoin");
var myWallet = ContractMultiwallet(0, /*use your account pass*/,compiledMultisigwallet, "./sol/multisigwallet.js:ZSCMultiSigWallet");
var myCongress = ContractMultitoken(0, /*use your account pass*/,compiledMultisigtoken, "./sol/multisigtoken.js:ZSCMultiSigToken", myToken.address);
var myFactory = ContractIcoFactory(0, /*use your account pass*/, compiledIcofactory, "./sol/icofactory.js:ZSCIcoFactory",myWallet.address, /*address for funded eth to team*/, myCongress.address, myToken.address);

4: activiate token: 2074 * 1000 * 1000 * 10**18 zsc allocated to myCongress.address
myToken.registerSale(0x0, myCongress.address, {from:eth.accounts[0], gas:4500000});


5: register an ICO (an contract object for ZSCCrowdsale) started from 2017.08.01:12 with duration 132480 minutes for 800m zsc with price 8000s
myFactory.registerZSCIcoPhase(“ico-001”, 1501560000 , 132480, 800 * 1000 * 1000 * 10**18, 8000, 8000, {from:eth.accounts[0], gas:4500000});


[test] use myetherwallet.com for test.
1: zsc token
totalSupply, balanceOf, transfer, transferFrom, approve, freeze, frozenRules

2: multisigwallet
submitTransaction, confirmTransaction

3: multisigtoken
submitTransaction, confirmTransaction

4: ZSCIcoFactory
setTokensForSale, setIcoPauseStatus, resetBeneficiaries, registerZSCIcoPhase, collectToWallet, collectToTeam, collectToCongress

5: ZSCCrowdsale
send eth to ZSCIcoFactory through a ZSCCrowdsale object, and transfer zsc from ZSCIcoFactory to the eth sender.

