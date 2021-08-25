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
#### config evn var
//eth node
web3url=https://xxxxxx
//parami node
parami=ws://xxxxx
//eth ad3 contract 
contract=xxxx
//eth contract admin address
ethHotWallet=xxxx
//eth contract admin private
privateKey=xxx

### start apply
sh startBridge.sh

### query log

tail -100f prarami.log
tail -100f etherum.log

