import {Command} from "commander";
import {getApi, getModules, waitTx} from "./utils.mjs";
import {Keyring} from "@polkadot/api";
import {sleep} from "./utils.mjs";
import Web3 from 'web3';
import {promises as fs} from 'fs';

async function main() {
    // https://github.com/tj/commander.js/
    const program = new Command();
    program.command('scan <from_block>')
        .requiredOption('--web3url <url>', 'web3 url. e.g. https://mainnet.infura.io/v3/your-projectId')
        .requiredOption('--depth <depth>', 'block depth', "12")
        .requiredOption('--contract <contract>', 'contract address', "0xdac17f958d2ee523a2206206994597c13d831ec7")
        .requiredOption('--ethHotWallet <ethHotWallet>', 'ethereum hotwallet address', "0x0000000000000000000000000000000000000000")
        .requiredOption('--config <config>', 'path of config file', "./config.json")
        .requiredOption('--parami <parami>', 'ws address of parami', "ws://104.131.189.90:6969")
        .action(async (from_block, args) => {
            await scan(args, Number(from_block));
        });
    await program.parseAsync(process.argv);
}

async function scanBlock(opts, api, moduleMetadata, admin, web3, contract, blockNum) {
    let [a, b] = [null, null];
    let txInParami = null;
    // https://blockchain.oodles.io/dev-blog/event-listeners-in-web3-js/
    // const a = await contract.methods.balanceOf("0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503").call();
    let events = await contract.getPastEvents({filter: {}, fromBlock: blockNum, toBlock: blockNum});
    for (let event of events) {
        // console.log(event);
        switch (event.event) {
            case 'Transfer':
                // Sending multiple extrinsics with the same parameters is no harmed.
                // But for the sake of speeding up eth rescanning, we should check
                // the existence of `event.transactionHash` in Parami chain.
                txInParami = await api.query.bridge.erc20Txs(event.transactionHash);
                if (txInParami.isNone && event.returnValues.to.toLowerCase() === opts.ethHotWallet.toLowerCase()) {
                    // [a, b] = waitTx(moduleMetadata);
                    // await api.tx.bridge.transfer(
                    //     event.transactionHash,
                    //     event.returnValues.from,
                    //     event.returnValues.value,
                    // ).signAndSend(admin, a);
                    // await b();
                }
                break;
            case 'Withdraw': // Withdraw(ethAccount, ss58formatAddress, amountOfAD3)
                // Sending multiple extrinsics with the same parameters is no harmed.
                // But for the sake of speeding up eth rescanning, we should check
                // the existence of `event.transactionHash` in Parami chain.
                txInParami = await api.query.bridge.erc20Txs(event.transactionHash);
                if (txInParami.isNone) {
                    // [a, b] = waitTx(moduleMetadata);
                    // await api.tx.bridge.withdraw(
                    //     event.transactionHash,
                    //     event.returnValues.from,
                    //     event.returnValues.to,
                    //     event.returnValues.value,
                    // ).signAndSend(admin, a);
                    // await b();
                }
                break;
            case 'Redeem':
                // Sending multiple extrinsics with the same parameters is no harmed.
                // But for the sake of speeding up eth rescanning, we should check
                // the existence of `event.transactionHash` in Parami chain.
                txInParami = await api.query.bridge.erc20Txs(event.transactionHash);
                if (txInParami.isNone) {
                    [a, b] = waitTx(moduleMetadata);
                    await api.tx.bridge.redeem(
                        event.transactionHash,
                        event.returnValues.from,
                        event.returnValues.to,
                        event.returnValues.value,
                    ).signAndSend(admin, a);
                    await b();
                }
                break;
            default:
                break;
        }
    }
}

async function scan(opts, from_block) {
    const web3 = new Web3(opts.web3url);
    // web3.eth.transactionConfirmationBlocks = 50;
    const contract = new web3.eth.Contract(JSON.parse((await fs.readFile('ad3/abis/ad3.json')).toString()), opts.contract);
    opts.depth = Number(opts.depth);

    let api = await getApi(opts.parami);
    const keyring = new Keyring({type: 'sr25519', ss58Format: 42});
    let moduleMetadata = await getModules(api);
    const config = JSON.parse((await fs.readFile(opts.config)).toString());
    const admin = keyring.addFromUri(config.admin);

    const runtimeFilePath = './runtime_data.json';
    if (from_block === 0) {
        try {
            const runtimeData = JSON.parse((await fs.readFile(runtimeFilePath)).toString());
            from_block = runtimeData.from_block;
            console.log("continue to scan eth from %s", from_block);
        } catch (_e) {
        }
    }

    for (; ;) {
        try {
            // get the newest block number.
            let bestBlockNum = await web3.eth.getBlockNumber();

            if (from_block === 0) {
                // https://etherscan.io/chart/blocktime
                // rescan from about 1 day ago. 14 secs per block.
                from_block = bestBlockNum - 6000;
            }

            if (from_block <= bestBlockNum - opts.depth) {
                console.log("bestBlockNum %s, targetBlockNum %s", bestBlockNum, from_block);
                await scanBlock(opts, api, moduleMetadata, admin, web3, contract, from_block);
                await fs.writeFile(runtimeFilePath, JSON.stringify({from_block}));
                from_block++;
            } else {
                await sleep(200);
            }
        } catch (e) {
            console.log(e);
            await sleep(2000)
        }
    }
}

main().then(r => {
    console.log("ok");
}).catch(err => {
    console.log(err);
});

// {
//     address: '0x615b4C92b3eF2E33E055009C716Fe3F90fC97Da8',
//         blockHash: '0x9c8622527ab0d66b5a7130662c8e3ed95cd1fa19199ae267bd99b66b22e7478d',
//     blockNumber: 8400725,
//     logIndex: 5,
//     removed: false,
//     transactionHash: '0x846b10921dd1d14958976ba36ff6abfd86487bb0438efc1b8110460131119249',
//     transactionIndex: 6,
//     id: 'log_33b28410',
//     returnValues: Result {
//     '0': '0x75a783E02634eEf427AAcF784894693eA8a48421',
//         '1': '5EnnPkCnS6br3N19vF8tE2um7coZyYKoVWfAxenk5GrsHJCT',
//         '2': '5000000000',
//         from: '0x75a783E02634eEf427AAcF784894693eA8a48421',
//         to: '5EnnPkCnS6br3N19vF8tE2um7coZyYKoVWfAxenk5GrsHJCT',
//         value: '5000000000'
// },
//     event: 'Withdraw',
//         signature: '0x901c03da5d88eb3d62ab4617e7b7d17d86db16356823a7971127d5181a842fef',
//     raw: {
//     data: '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000012a05f200000000000000000000000000000000000000000000000000000000000000003035456e6e506b436e53366272334e3139764638744532756d37636f5a79594b6f5657664178656e6b35477273484a435400000000000000000000000000000000',
//         topics: [
//         '0x901c03da5d88eb3d62ab4617e7b7d17d86db16356823a7971127d5181a842fef',
//         '0x00000000000000000000000075a783e02634eef427aacf784894693ea8a48421'
//     ]
// }
// }

// {
// address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
// blockHash: '0x578552aea53a38c6333a7d9950de1e70ddbba7d7b84684b30e67231c2b83de2f',
// blockNumber: 12199047,
// logIndex: 234,
// removed: false,
// transactionHash: '0xb6697154235da4b30b04062a91116e903ccfb9c7fc62aca60441d361f26abf6f',
// transactionIndex: 156,
// id: 'log_d6b2d4d2',
// returnValues: Result {
// '0': '0x2d80587BfB4B651328490a732128D2eC2E59231D',
//     '1': '0xE7501152b178599Cf3F2b4ea16a38fAF83b05De9',
//     '2': '200000000000',
//     from: '0x2d80587BfB4B651328490a732128D2eC2E59231D',
//     to: '0xE7501152b178599Cf3F2b4ea16a38fAF83b05De9',
//     value: '200000000000'
// },
// event: 'Transfer',
// signature: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
// raw: {
// data: '0x0000000000000000000000000000000000000000000000000000002e90edd000',
//     topics: [
//     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
//     '0x0000000000000000000000002d80587bfb4b651328490a732128d2ec2e59231d',
//     '0x000000000000000000000000e7501152b178599cf3f2b4ea16a38faf83b05de9'
// ]
// }
// }
