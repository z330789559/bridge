import {Command} from "commander";
import jayson from "jayson";

async function main() {
    // https://github.com/tj/commander.js/
    const program = new Command();
    program.command('scan <from_block>')
        .requiredOption('--web3url <url>', 'web3 url. e.g. https://mainnet.infura.io/v3/your-projectId')
        .action(async (from_block, args) => {
            await scan(args, from_block);
        });
    await program.parseAsync(process.argv);
}


async function request(client, method, params) {
    // https://www.npmjs.com/package/jayson#client
    return await new Promise((resolve, reject) => {
        client.request(method, params, function (err, res) {
            if (err) return reject(err);
            resolve(res.result);
        });
    })
}

async function scan(opts, from_block) {
    const client = jayson.client.https(opts.web3url);

    for (; ;) {
        try {
            // get the newest block number.
            let a = await request(client, "eth_blockNumber", null);
            console.log(a);

            break;
            // const last = await getFinalizedHeadNumber(api);
            // if (from_block <= last) {
            //     await handleEvents(api, from_block, moduleMetadata);
            //     from_block++;
            // } else {
            //     await sleep(200);
            // }
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




