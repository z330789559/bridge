#!bin/sh
echo "start ......"

# set -a; source ./env_var; set +a;

echo $web3url $parami $ethHotWallet $key $contract

echo "start ethrenum scan"
echo $(pwd)
 chmod a+rwx ./scan-ethereum.mjs
 nohup node scan-ethereum.mjs scan  0  --web3url  $web3url --contract  $contract \
 --ethHotWallet $ethHotWallet   --parami  $parami>etherum.log 2>&1  &
nohup node scan-parami.mjs scan  0  --web3url  $web3url --contract  $contract  --pk $key\
 --ethHotWallet $ethHotWallet   --parami  $parami>prarami.log 2>&1  &

 echo "start over"