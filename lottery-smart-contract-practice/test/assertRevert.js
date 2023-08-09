module.exports = async (promise) => {
    try {
        await promise;
        // promise를 기다렸는데 catch로 넘어가지 않으면 fail 발생
        assert.fail('Expected revert not received');
    } catch (error) {
        // 원하는 대로 revert를 받았다면
        const revertFound = error.message.search('revert') >= 0;
        assert(revertFound, `Expected "revert", got ${error} instead`);
    }
}