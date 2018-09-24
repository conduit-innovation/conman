# Conman

A connection managing monitor.

## Installation

- NodeJS >= 8.x.x

`npm install -g conman-monitor`

## Overview

Conman monitors network interfaces and ICMP ping availability of hosts, and then runs a command on failure of either to restart the interface, or do something else.

You can set the configuration by passing an argument to `conman`. Eg. `conman config.json`. An example config JSON file is below:

```JSON
{
    "hostname": "example.com",
    "connections": {
        "vpn": {
            "monitor": {
                "if": "ppp0",
                "icmp": "10.0.0.1"
            },
            "restart_cmd": "sudo systemctl restart netextender.service",
            "interval": 10000,
            "notify": {
                "email": [
                    "me@example.com",
                    "you@example.com"
                ]
            }
        }
    }
}
```