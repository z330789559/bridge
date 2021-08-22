# Parami Bridge

A simple centralized bridge to transfer AD3 erc20 assets from Ethereum to Parami.


 update change
 1. contract upgrade 8.0
 2. add parami-eth relayer
 3. upgrade api version to lastest
 4. add  desposit command 
 5. modify ad3 contract 


## run step
### config 
#### open env_var env file
//eth node
web3url=https://rinkeby.infura.io/v3/7307908c50f44d578fd7470e6df7921e 
//parami node
parami=ws://127.0.0.1:9944
//eth ad3 contract 
contract=0xB6B6616C658eF743b486369a10Eb257b8f1F8f78
//eth contract admin address
ethHotWallet=0x9F883b12fD0692714C2f28be6C40d3aFdb9081D3
//eth contract admin private
key=8af1d44de729c5ce7627470c13fda1b09f962c9313bb87059a07f856da76a4c9

### start apply
sh startBridge.sh

### query log

tail -100f prarami.log
tail -100f etherum.log

