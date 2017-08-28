function ContractToken(account_index, account_pass, solcompiled, contractname) {
var index = account_index;
var pass = account_pass;
personal.unlockAccount(eth.accounts[index], pass);

var databin = "0x" + solcompiled.contracts[contractname].bin;
var greeterContract = web3.eth.contract(JSON.parse(solcompiled.contracts[contractname].abi));
var greeter = greeterContract.new({from:web3.eth.accounts[index], data: databin, gas: 2500000}, function(e, contract){
 if(!e) {
    if(!contract.address) {
      console.log("ContractToken send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
    } else {
      console.log("ContractToken mined! Address: " + contract.address);
      console.log(contract);
    }
  } else {
    console.log("ContractToken: Error!!");
    console.log(e);
  }
})
return greeter;
}


function ContractMultiwallet(account_index, account_pass, solcompiled, contractname) {
  var index = account_index;
  var pass = account_pass;
  personal.unlockAccount(eth.accounts[index], pass);

  //add account address here
  var owners = ["0x1", "0x2"];

  var required_voter = 2;

  var databin = "0x" + solcompiled.contracts[contractname].bin;
  var greeterContract = web3.eth.contract(JSON.parse(solcompiled.contracts[contractname].abi));
  var greeter = greeterContract.new(owners, required_voter, {from:web3.eth.accounts[index], data: databin, gas: 2500000}, function(e, contract){
    if(!e) {
      if(!contract.address) {
        console.log("ContractMultiwallet send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
      } else {
        console.log("ContractMultiwallet mined! Address: " + contract.address);
        console.log(contract);
      }
    } else {
      console.log("ContractMultiwallet: Error!!");
      console.log(e);
    }
  })
  return greeter
}


function ContractMultitoken(account_index, account_pass, solcompiled, contractname, tokenAddress) {
  var index = account_index;
  var pass = account_pass;
  personal.unlockAccount(eth.accounts[index], pass);


  var databin = "0x" + solcompiled.contracts[contractname].bin;
  var greeterContract = web3.eth.contract(JSON.parse(solcompiled.contracts[contractname].abi));
  
  //!!!!!!add account address here
  var owners = ["0x1", "0x2"];

  var required_voter = 2;

  var greeter = greeterContract.new(owners, required_voter, tokenAddress, {from:web3.eth.accounts[index], data: databin, gas: 3500000}, function(e, contract){
    if(!e) {
      if(!contract.address) {
        console.log("ContractMultitoken send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
      } else {
        console.log("ContractMultitoken mined! Address: " + contract.address);
        console.log(contract);
      }
    } else {
      console.log("ContractMultitoken: Error!!");
      console.log(e);
    }
  })
  return greeter
}



