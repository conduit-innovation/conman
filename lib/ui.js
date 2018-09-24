const clc = require('cli-color');

module.exports = {
    header() {
        console.log(           clc.blackBright('-----------------------------------------------------------'));
        console.log(            clc.xterm(161)('Conman v1.0.0                               https://cndu.it'));
        console.log(           clc.blackBright('(C) Conduit Innovation Ltd 2018. Released under MIT License'));
        console.log(           clc.blackBright('-----------------------------------------------------------'));
    },
    synopsis(config) {

        logger.info('Configuration file loaded');

        for(var i in config.connections) {
            logger.info('Connection: ' + i);

            for(var j in config.connections[i].monitor) {
                logger.info('\t- Monitoring ' + j + ': ' + config.connections[i].monitor[j])
            }

            logger.info('\t- Check interval: ' + config.connections[i].interval + 'ms');

            for(var j in config.connections[i].notify) {
                logger.info('\t- Notify ' + j + ': ' + config.connections[i].notify[j].join(', '))
            }
        }
    
    }

}