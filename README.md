# NeoFS Status page

## Overview

NeoFS status monitoring page using React framework under the hood

## Requirements

- make
- docker
- node.js
- python

## Make instruction
* Compile the build using `make` (will be generated in `output` dir)
* For GitHub release use `make release` and attach all files from `release` dir

## Getting started for getting metrics
1. Create virtual environment
```
python3 -m venv env
source env/bin/activate
pip3 install requests
```
2. Run python3
```
python3 get_webstat_metrics.py
```
Parameters:
- `--server` - server api path (required)
- `--output` - output dir with the file name and extension (by default, stdout)
