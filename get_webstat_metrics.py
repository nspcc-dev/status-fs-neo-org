#!/usr/bin/env python3

import time
import sys
import argparse
import asyncio
import requests
import json

from neo3.core import types
from neo3.api.helpers import unwrap
from neo3.api.wrappers import ChainFacade, GenericContract

from prometheus_client.parser import text_string_to_metric_families


NETMAP_HASH_MAINNET = '0x7c5bdb23e36cc7cce95bf42f3ab9e452c2501df1'
NETMAP_HASH_TESTNET = '0xc4576ea5c3081dd765a17aaaa73d9352e74bdc28'


async def check_epoch(output, net, rpc_host, netmap_hash):
    response_getblockcount = requests.post(rpc_host, data=json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getblockcount",
        "params": []
    })).json()
    block_count = response_getblockcount['result']

    facade = ChainFacade(rpc_host=rpc_host)
    contract_hash = types.UInt160.from_string(netmap_hash)
    contract = GenericContract(contract_hash)
    result = await facade.test_invoke(contract.call_function("lastEpochBlock"))
    last_epoch_block = unwrap.as_int(result)
    result = await facade.test_invoke(contract.call_function("config", ['EpochDuration']))
    epoch_duration = int.from_bytes(unwrap.as_bytes(result)[:2], "little")

    response_getblockheader = requests.post(rpc_host, data=json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getblockheader",
        "params": [block_count - 1, 1]
    })).json()
    block_timestamp = response_getblockheader['result']['time']

    if block_count - 1 - epoch_duration - 10 > last_epoch_block:
        output['status'][net] = 'Degraded'
        output['statusmsgs'][net].append(f"Epoch is not updated for {block_count - 1 - last_epoch_block} block(s) (normal duration: {epoch_duration})")

    if block_timestamp + (5 * 60000) < int(time.time()) * 1000:
        output['status'][net] = 'Degraded'
        output['statusmsgs'][net].append("No new blocks for more than 5m")


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url-main", type=str, default='http://localhost:16512/metrics')
    parser.add_argument("--url-test", type=str, default='http://localhost:16513/metrics')
    parser.add_argument("--output", type=str, default='-')
    args = parser.parse_args()

    output = {
        "status": {
            "mainnet": "Unknown",
            "testnet": "Unknown",
        },
        "statusmsgs": {
            "mainnet": [],
            "testnet": [],
        },
        "network_epoch": {
            "mainnet": "unknown",
            "testnet": "unknown",
        },
        "containers": {
            "mainnet": "unknown",
            "testnet": "unknown",
        },
        "time": time.time(),
        "node_map": [],
        "contract": {
            "mainnet": {
                "address": "NNxVrKjLsRkWsmGgmuNXLcMswtxTGaNQLk",
                "script_hash": "2cafa46838e8b564468ebd868dcafdd99dce6221",
            },
            "testnet": {
                "address": "NZAUkYbJ1Cb2HrNmwZ1pg9xYHBhm2FgtKV",
                "script_hash": "3c3f4b84773ef0141576e48c3ff60e5078235891",
            }
        },
        "gateways": {
            "mainnet": [
                ["https://http.fs.neo.org", "https://rest.fs.neo.org/v1"],
            ],
            "testnet": [
                ["https://http.t5.fs.neo.org", "https://rest.t5.fs.neo.org/v1"],
            ],
        },
        "side_chain_rpc_nodes": {
            "mainnet": [
                ["https://rpc1.morph.fs.neo.org:40341", "wss://rpc1.morph.fs.neo.org:40341/ws"],
                ["https://rpc2.morph.fs.neo.org:40341", "wss://rpc2.morph.fs.neo.org:40341/ws"],
                ["https://rpc3.morph.fs.neo.org:40341", "wss://rpc3.morph.fs.neo.org:40341/ws"],
                ["https://rpc4.morph.fs.neo.org:40341", "wss://rpc4.morph.fs.neo.org:40341/ws"],
                ["https://rpc5.morph.fs.neo.org:40341", "wss://rpc5.morph.fs.neo.org:40341/ws"],
                ["https://rpc6.morph.fs.neo.org:40341", "wss://rpc6.morph.fs.neo.org:40341/ws"],
                ["https://rpc7.morph.fs.neo.org:40341", "wss://rpc7.morph.fs.neo.org:40341/ws"],
            ],
            "testnet": [
                ["https://rpc1.morph.t5.fs.neo.org:51331", "wss://rpc1.morph.t5.fs.neo.org:51331/ws"],
                ["https://rpc2.morph.t5.fs.neo.org:51331", "wss://rpc2.morph.t5.fs.neo.org:51331/ws"],
                ["https://rpc3.morph.t5.fs.neo.org:51331", "wss://rpc3.morph.t5.fs.neo.org:51331/ws"],
                ["https://rpc4.morph.t5.fs.neo.org:51331", "wss://rpc4.morph.t5.fs.neo.org:51331/ws"],
                ["https://rpc5.morph.t5.fs.neo.org:51331", "wss://rpc5.morph.t5.fs.neo.org:51331/ws"],
                ["https://rpc6.morph.t5.fs.neo.org:51331", "wss://rpc6.morph.t5.fs.neo.org:51331/ws"],
                ["https://rpc7.morph.t5.fs.neo.org:51331", "wss://rpc7.morph.t5.fs.neo.org:51331/ws"],
            ],
        },
        "storage_nodes": {
            "mainnet": [
                ["grpcs://st1.storage.fs.neo.org:8082", "st1.storage.fs.neo.org:8080"],
                ["grpcs://st2.storage.fs.neo.org:8082", "st2.storage.fs.neo.org:8080"],
                ["grpcs://st3.storage.fs.neo.org:8082", "st3.storage.fs.neo.org:8080"],
                ["grpcs://st4.storage.fs.neo.org:8082", "st4.storage.fs.neo.org:8080"],
            ],
            "testnet": [
                ["grpcs://st1.t5.fs.neo.org:8082", "st1.t5.fs.neo.org:8080"],
                ["grpcs://st2.t5.fs.neo.org:8082", "st2.t5.fs.neo.org:8080"],
                ["grpcs://st3.t5.fs.neo.org:8082", "st3.t5.fs.neo.org:8080"],
                ["grpcs://st4.t5.fs.neo.org:8082", "st4.t5.fs.neo.org:8080"],
            ],
        },
        "neo_go_rpc_nodes": {
            "mainnet": [
                ["https://rpc10.n3.nspcc.ru:10331", "wss://rpc10.n3.nspcc.ru:10331/ws"],
            ],
            "testnet": [
                ["https://rpc.t5.n3.nspcc.ru:20331", "wss://rpc.t5.n3.nspcc.ru:20331/ws"],
            ],
        },
    }

    try:
        map_node = []
        node_mainnet_count = 0
        node_testnet_count = 0

        for family in text_string_to_metric_families(requests.get(args.url_main).content.decode('utf-8')):
            if family.name == 'neofs_net_monitor_epoch':
                output['network_epoch']['mainnet'] = family.samples[0].value
            if family.name == 'neofs_net_monitor_containers_number':
                output['containers']['mainnet'] = family.samples[0].value
            if family.name == 'neofs_net_monitor_netmap':
                for sample in family.samples:
                    node_mainnet_count += sample.value
                    sample.labels['nodes']=[{'net': 'main', 'value': sample.value }]
                    map_node.append( sample.labels )

        for family in text_string_to_metric_families(requests.get(args.url_test).content.decode('utf-8')):
            if family.name == 'neofs_net_monitor_epoch':
                output['network_epoch']['testnet'] = family.samples[0].value
            if family.name == 'neofs_net_monitor_containers_number':
                output['containers']['testnet'] = family.samples[0].value
            if family.name == 'neofs_net_monitor_netmap':
                for sample in family.samples:
                    node_testnet_count += sample.value
                    sample.labels['nodes']=[{'net': 'test', 'value': sample.value }]
                    map_node.append( sample.labels )

        output['node_map'] = map_node

        output['status']['mainnet'] = "Healthy"
        output['status']['testnet'] = "Healthy"
        await check_epoch(output, 'mainnet', output['side_chain_rpc_nodes']['mainnet'][4][0], NETMAP_HASH_MAINNET)
        await check_epoch(output, 'testnet', output['side_chain_rpc_nodes']['testnet'][2][0], NETMAP_HASH_TESTNET)

        if node_mainnet_count <= 3:
            output['status']['mainnet'] = "Severe"
            output['statusmsgs']['mainnet'].append(f"{node_mainnet_count} / 5 nodes is available")
        elif node_mainnet_count <= 4:
            output['status']['mainnet'] = "Degraded"
            output['statusmsgs']['mainnet'].append(f"{node_mainnet_count} / 5 nodes is available")

        if node_testnet_count <= 2:
            output['status']['testnet'] = "Severe"
            output['statusmsgs']['testnet'].append(f"{node_testnet_count} / 4 nodes is available")
        elif node_testnet_count <= 3:
            output['status']['testnet'] = "Degraded"
            output['statusmsgs']['testnet'].append(f"{node_testnet_count} / 4 nodes is available")
    except:
        # Connection error
        output['status'] = {
            "mainnet": "Unknown",
            "testnet": "Unknown",
        }
        output['statusmsgs'] = {
            "mainnet": [],
            "testnet": [],
        }

    with (open(args.output, 'w') if args.output != '-' else sys.stdout) as handle:
        handle.write(json.dumps(output, separators=(',', ':')))

if __name__ == "__main__":
    asyncio.run(main())
