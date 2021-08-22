
const fs  =require('fs');
const Web3=require('web3');

opts={
    web3url:"https://rinkeby.infura.io/v3/7307908c50f44d578fd7470e6df7921e",
    contractAddress:"0x850068f1181d4ac37a78f4b52c060c452b7cedc7",
    address:"0x9F883b12fD0692714C2f28be6C40d3aFdb9081D3",
    privateKey:"8af1d44de729c5ce7627470c13fda1b09f962c9313bb87059a07f856da76a4c9"
}
const web3 = new Web3(opts.web3url);
var _privateKey = "0x8af1d44de729c5ce7627470c13fda1b09f962c9313bb87059a07f856da76a4c9"
// web3.eth.transactionConfirmationBlocks = 50;
const contract = new web3.eth.Contract(JSON.parse((fs.readFileSync('ad3/abis/ad3.json')).toString()), opts.contractAddress);
async function sendTx(tx,contract,address,privateKey){

    console.log("call",tx)
    const rawTx = {
        // this could be provider.addresses[0] if it exists
        "from": address, 
        "to": opts.contractAddress,
        // target address, this could be a smart contract address
        "gasPrice": 4500000000,
        "gas": web3.utils.toHex("519990"),
        "gasLimit":web3.utils.toHex("519990"),
        "value": "0x0",
        // this encodes the ABI of the method and the arguements
        "data": contract.methods.mint(rawTx.ethAddress,web3.utils.toHex(rawTx.amount),web3.utils.toHex(rawTx.nonce),rawTx.paramiAddress).encodeABI(),
        "chainId": 0x04
      };


      const signedTx = await web3.eth.accounts.signTransaction(rawTx, privateKey)
      console.log(signedTx.rawTransaction)
      let res=await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(res)

}

let tx = {
    ethAddress: '0x9F883b12fD0692714C2f28be6C40d3aFdb9081D3',
    amount: web3.utils.toHex('10000000000000000000'),
    nonce: web3.utils.toHex('17'),
    status: true,
    paramiAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
  }
 sendTx(tx,contract,opts.address,_privateKey);