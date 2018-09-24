const fs = require('fs');

module.exports = (fn) => {
            return JSON.parse(fs.readFileSync(fn));
        }