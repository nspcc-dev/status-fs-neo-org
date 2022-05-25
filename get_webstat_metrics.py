import requests
import json
import time

from config import WEBSTAT_OUTPUT_PATH, WEBSTAT_SERVER_HOST

if __name__ == '__main__':
    output = {
        'status': 'Unknown',
        'network_epoch': 'unknown',
        'containers': 'unknown',
        'time': time.time(),
        'node_map': [],
        'contract': {
            'mainnet': {
                'address': 'NNxVrKjLsRkWsmGgmuNXLcMswtxTGaNQLk',
                'script_hash': '2cafa46838e8b564468ebd868dcafdd99dce6221',
            },
            'testnet': {
                'address': 'NadZ8YfvkddivcFFkztZgfwxZyKf1acpRF',
                'script_hash': 'b65d8243ac63983206d17e5221af0653a7266fa1',
            }
        },
        'side_chain_rpc_nodes': {
            'mainnet': [
                ['https://rpc1.morph.fs.neo.org:40341', 'wss://rpc1.morph.fs.neo.org:40341/ws'],
                ['https://rpc2.morph.fs.neo.org:40341', 'wss://rpc2.morph.fs.neo.org:40341/ws'],
                ['https://rpc3.morph.fs.neo.org:40341', 'wss://rpc3.morph.fs.neo.org:40341/ws'],
                ['https://rpc4.morph.fs.neo.org:40341', 'wss://rpc4.morph.fs.neo.org:40341/ws'],
                ['https://rpc5.morph.fs.neo.org:40341', 'wss://rpc5.morph.fs.neo.org:40341/ws'],
                ['https://rpc6.morph.fs.neo.org:40341', 'wss://rpc6.morph.fs.neo.org:40341/ws'],
                ['https://rpc7.morph.fs.neo.org:40341', 'wss://rpc7.morph.fs.neo.org:40341/ws'],
            ],
            'testnet': [
                ['https://rpc01.morph.testnet.fs.neo.org:51331', 'wss://rpc01.morph.testnet.fs.neo.org:51331/ws'],
                ['https://rpc02.morph.testnet.fs.neo.org:51331', 'wss://rpc02.morph.testnet.fs.neo.org:51331/ws'],
                ['https://rpc03.morph.testnet.fs.neo.org:51331', 'wss://rpc03.morph.testnet.fs.neo.org:51331/ws'],
                ['https://rpc04.morph.testnet.fs.neo.org:51331', 'wss://rpc04.morph.testnet.fs.neo.org:51331/ws'],
                ['https://rpc05.morph.testnet.fs.neo.org:51331', 'wss://rpc05.morph.testnet.fs.neo.org:51331/ws'],
                ['https://rpc06.morph.testnet.fs.neo.org:51331', 'wss://rpc06.morph.testnet.fs.neo.org:51331/ws'],
                ['https://rpc07.morph.testnet.fs.neo.org:51331', 'wss://rpc07.morph.testnet.fs.neo.org:51331/ws'],
            ],
        },
    }
    
    try:
        response_epoch = requests.get(f"{WEBSTAT_SERVER_HOST}/api/v1/query?query=neofs_net_monitor_epoch{{net='main'}}").json()
        output['network_epoch'] = response_epoch['data']['result'][0]['value'][1]

        response_containers = requests.get(f"{WEBSTAT_SERVER_HOST}/api/v1/query?query=neofs_net_monitor_containers_number{{net='main'}}").json()
        output['containers'] = response_containers['data']['result'][0]['value'][1]

        response_map = requests.get(f"{WEBSTAT_SERVER_HOST}/api/v1/query?query=neofs_net_monitor_netmap").json()
        map_node = []
        for node in response_map['data']['result']:
            is_exist = False
            for map_node_item in map_node:
                if map_node_item['location'] == node['metric']['location']:
                    is_exist = True
                    map_node_item['nodes'].append({
                        "value": node['value'][1],
                        "net": node['metric']['net'],
                    })
                    break

            if not is_exist:
                map_node.append({
                    "latitude": node['metric']['latitude'],
                    "location": node['metric']['location'],
                    "longitude": node['metric']['longitude'],
                    "nodes": [{
                        "value": node['value'][1],
                        "net": node['metric']['net'],
                    }],
                })

        output['node_map'] = map_node
        output['status'] = 'Healthy'
    except:
        print('Connection error')

    with open(f"{WEBSTAT_OUTPUT_PATH}output.json", 'w') as outfile:
        json.dump(output, outfile)