<p align="center">
<img src="./.github/logo.svg" width="500px" alt="NeoFS">
</p>
<p align="center">
  <a href="https://fs.neo.org">NeoFS</a> is a decentralized distributed object storage integrated with the <a href="https://neo.org">Neo Blockchain</a>.
</p>

---

# NeoFS Status page

## Overview

NeoFS status monitoring page using React framework under the hood

## Requirements

- make
- docker
- node.js
- python

## Make instructions
* Compile the build using `make` (will be generated in `output` dir)
* Start app using `make start PORT=3000` (PORT=3000 by default)
* Get release dir with tar.gz using `make release`

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
