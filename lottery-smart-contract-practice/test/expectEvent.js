const assert = require('chai').assert;

// logs 오브젝트를 넣어준다.
const inLogs = async (logs, eventName) => {
    const event = logs.find(e => e.event === eventName);
    assert.exists(event);
}

module.exports = {
    inLogs
}