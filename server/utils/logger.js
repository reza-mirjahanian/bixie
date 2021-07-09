'use strict';
//@todo use better Logger
module.exports = {
    log: (message = '', extra) => {
        console.log("#Log: " + message);
        if (extra) {
            console.log(extra)
        }
    },
    error: (message = "Error!", extra) => {
        console.error("#Error: " + message);
        if (extra) {
            console.error(extra)
        }
    }
}
