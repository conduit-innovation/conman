
const Winston = require('winston');
const clc = require('cli-color');
const Connection = require('./lib/connection');
const Config = require('./lib/config');
const UI = require('./lib/ui');

var connections = [];

UI.header();

const argv = require('yargs').demandCommand(1).argv

global.logger = Winston.createLogger({
    format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.simple()
    ),    
    transports: [
        new (Winston.transports.Console)({ colorize: true })
    ]
});

var config = global._config = Config(argv._[0]);

UI.synopsis(config);

for(var i in config.connections) {
    connections.push(new Connection(i, config.connections[i]));
}





