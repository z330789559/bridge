import {getApi, getModules, waitTx, unit} from "./utils.mjs";
import {Keyring} from "@polkadot/api";
import {bnToBn} from "@polkadot/util";
import {Command} from "commander";

async function main() {
    const ss58Format = 42;
    const keyring = new Keyring({type: 'sr25519', ss58Format});
    const program = new Command();
    program.option('--ws <addr>', 'node ws addr', 'ws://104.131.189.90:9944');

    program.command('setBirdgeAdmin <root> <account>').action(async (root, account) => {
        await demo_setBridgeAdmin(program.opts().ws, keyring, root, account);
    });

    program.command('transfer <admin> <hash> <eth_addr> <value>').action(async (admin, hash, eth_addr, value) => {
        await transfer(program.opts().ws, keyring, admin, hash, eth_addr, value);
    });

    program.command('showErc20Txs').action(async () => {
        await showErc20Txs(program.opts().ws);
    });

    program.command('showErc20Balances').action(async () => {
        await showErc20Balances(program.opts().ws);
    });

    program.command('withdraw <admin> <hash> <eth_addr> <parami_addr> <value>').action(async (admin, hash, eth_addr, parami_addr, value) => {
        await withdraw(program.opts().ws, keyring, admin, hash, eth_addr, parami_addr, value);
    });

    program.command('redeem <admin> <hash> <eth_addr> <parami_addr> <value>').action(async (admin, hash, eth_addr, parami_addr, value) => {
        await redeem(program.opts().ws, keyring, admin, hash, eth_addr, parami_addr, value);
    });

    await program.parseAsync(process.argv);
}

async function redeem(ws, keyring, admin, hash, eth_addr, parami_addr, value) {
    let api = await getApi(ws);
    let moduleMetadata = await getModules(api);
    admin = keyring.addFromUri(admin);
    let [a, b] = waitTx(moduleMetadata);
    await api.tx.bridge.redeem(hash, eth_addr, parami_addr, bnToBn(value).mul(unit)).signAndSend(admin, a);
    await b();
}

async function withdraw(ws, keyring, admin, hash, eth_addr, parami_addr, value) {
    let api = await getApi(ws);
    let moduleMetadata = await getModules(api);
    admin = keyring.addFromUri(admin);
    let [a, b] = waitTx(moduleMetadata);
    await api.tx.bridge.withdraw(hash, eth_addr, parami_addr, bnToBn(value).mul(unit)).signAndSend(admin, a);
    await b();
}

async function transfer(ws, keyring, admin, hash, eth_addr, value) {
    let api = await getApi(ws);
    let moduleMetadata = await getModules(api);
    admin = keyring.addFromUri(admin);

    let [a, b] = waitTx(moduleMetadata);
    await api.tx.bridge.transfer(hash, eth_addr, bnToBn(value).mul(unit)).signAndSend(admin, a);
    await b();
}

async function demo_setBridgeAdmin(ws, keyring, root, account) {
    let api = await getApi(ws);
    let moduleMetadata = await getModules(api);
    account = keyring.addFromUri(account);
    root = keyring.addFromUri(root);
    let [a, b] = waitTx(moduleMetadata);
    await api.tx.sudo.sudo(api.tx.bridge.setBridgeAdmin(account.address)).signAndSend(root, a);
    await b();

    const admin = await api.query.bridge.bridgeAdmin();
    if (admin.isSome) {
        console.log("current admin: ", admin.unwrap().toHuman());
    }
}

async function showErc20Balances(ws) {
    let api = await getApi(ws);
    const all = await api.query.bridge.erc20Balances.entries();
    for (const account of all) {
        let tx_hash = account[0];
        const len = tx_hash.length;
        tx_hash = tx_hash.buffer.slice(33 + 16, len);
        tx_hash = "0x" + Buffer.from(tx_hash).toString('hex');
        let data = account[1].toHuman();
        console.log("%s", JSON.stringify({tx_hash, data}));
    }
}

async function showErc20Txs(ws) {
    let api = await getApi(ws);
    const all = await api.query.bridge.erc20Txs.entries();
    for (const account of all) {
        let tx_hash = account[0];
        const len = tx_hash.length;
        tx_hash = tx_hash.buffer.slice(33, len);
        tx_hash = "0x" + Buffer.from(tx_hash).toString('hex');
        let data = account[1].toHuman();
        console.log("%s", JSON.stringify({tx_hash, data}));
    }
}

main().then(r => {
    console.log("ok");
    process.exit();
}).catch(err => {
    console.log(err);
});
