const os = require('os');
var ping = require('pinger');
const nodemailer = require('nodemailer');
const { execFile } = require('child_process');
const { promisify } = require('util');


module.exports = class Connection {

    constructor(name, conn) {
        this.conn = conn;
        this.name = name;
        this.interval = false;
        this.inProgress = false;
        this.isRestarting = false;
        this.state = null;
        this.lastState = null;

        this.activate();
    }

    notify(state) {

        if(this.conn.notify.email) {

            let transporter = nodemailer.createTransport({
                sendmail: true,
                newline: 'unix',
                path: '/usr/sbin/sendmail'
            });
            transporter.sendMail({
                from: 'no-reply@cndu.it',
                to: this.conn.notify.email,
                subject: 'Conman: '+ _config.hostname + '#' + this.name + ' is ' + (state ? 'up' : 'down'),
                text: (state ? 'The service has returned to normal.' : 'A restart attempt has been made with "'+this.conn.restart_cmd+'"')
            }, (err, info) => {
                console.log(info.envelope);
                console.log(info.messageId);
            });
        }

    }

    restart() {
        return new Promise(async (resolve, reject) => {

            logger.info('Restarting ' + this.name);

            if(this.isRestarting) {
                logger.warn('Restart already in progress for ' + this.name);
                return resolve();
            }

            this.isRestarting = true;

            var output = await promisify(execFile)(this.conn.restart_cmd, {
               shell: true
            });

            this.isRestarting = false;

            resolve();
        });
    }

    checks() {
        return new Promise(async (resolve, reject) => {

            var passCount = 0;
            var failCount = 0;

            for(var type in this.conn.monitor) {

                switch(type) {
                    case 'if': 
                        var ifs = os.networkInterfaces();

                        if(typeof(ifs[this.conn.monitor[type]]) !== 'undefined') {
                            logger.info('Interface ' + this.conn.monitor[type] + ' is up.');
                            passCount ++;
                        } else {
                            logger.warn('Interface ' + this.conn.monitor[type] + ' is down.');
                            failCount ++;
                        }

                        break;
                    case 'icmp':

                        var p = new Promise(async (resolve, reject) => {
                            
                           ping(this.conn.monitor[type], (err, ms) => {
                                resolve(!err);
                           });

                        });

                        var r = await p;

                        if(r) {
                            logger.info('Host ICMP ' + this.conn.monitor[type] + ' is up.');
                            passCount ++;
                        } else {
                            logger.warn('Host ICMP ' + this.conn.monitor[type] + ' is down.');
                            failCount ++;
                        }
                        
                    break;
                }


                
            }

            if(failCount === 0) {
                resolve(true);
            } else {
                resolve(false);
            }
            
        });
    }

    activate() {

        this.interval = setInterval(async () => {

            if(this.inProgress) {
                logger.warn('Check already in progress for ' + this.name);
                return;
            }

            logger.info('Performing check for ' + this.name);
            
            this.inProgress = true;

            this.state = await this.checks();

            if(this.lastState !== null) {

                if(this.lastState !== this.state) {
                    this.notify(this.state);
                }

            }

            this.lastState = this.state;

            if(this.state === false) {
                logger.warn('Check failed for ' + this.name);
                await this.restart();
            } else {
                logger.info('Check passed for ' + this.name);
            }

            this.inProgress = false;

        }, this.conn.interval);

    }

}