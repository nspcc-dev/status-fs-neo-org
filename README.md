# Morphbits status page

## Overview

Morphbits status monitoring page using React framework under the hood

## Requirements

- make
- docker
- node.js
- python

## Make instruction
* Compile the build using `make` (will be generated in `output` folder)

## Get output.json with metrics
1. Update `config.py` file
```
WEBSTAT_SERVER_HOST = 'https://monitor.nspcc.ru:8428' # default value
WEBSTAT_OUTPUT_PATH = './output' # default value
```
2. Start python script
```
python3 -m venv env
source env/bin/activate
pip3 install requests
python3 get_webstat_metrics.py
```
Will be generated in `WEBSTAT_OUTPUT_PATH/output.json` path