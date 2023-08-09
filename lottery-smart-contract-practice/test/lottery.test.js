const Lottery = artifacts.require("Lottery");
const { assert } = require('chai');
const assertRevert = require('./assertRevert');
const expectEvent = require('./expectEvent');

//const truffleAssert = require('truffle-assertions');


contract('Lottery', function([deployer, user1, user2]) { 
// parameter는 account 들이 순서대로 들어간다.
// deployer = (0) 0xF76c9B7012c0A3870801eaAddB93B6352c8893DB (100 ETH)
// user1 = (1) 0x84F43c88Dc56510D043D5EE922D57549959c4C3C (100 ETH)
// user2 = (2) 0x7eC36bc569C4B6fD3dDD7B7ebc9e1eDb2e736339 (100 ETH)
    let lottery;
    let betAmount = 5 * 10 ** 15;
    let bet_block_interval = 3;

    // Big Number
    let betAmountBN = new web3.utils.BN('5000000000000000');



    // only() 특정 테스트만
    // beforeEach 블록은 각 테스트 실행 전에 Lottery 컨트랙트 인스턴스를 배포합니다. 이렇게 하면 lottery 변수가 정의되고 테스트에서 사용할 수 있습니다.
    beforeEach(async () => {
        lottery = await Lottery.new();
        
    })


    // 팟 머니가 0원이라면 assert
    // it('getPot should return current pot', async () => {
    //     let pot = await lottery.getPot();
    //     assert.equal(pot, 0);
    // })

    describe('Bet', function () {
        it('should fail when the bet money is not 0.005 ETH', async () => {
            // Fail transaction
            await assertRevert(lottery.bet('0xab', {from : user1, value:betAmount}));

            //await truffleAssert.fails(lottery.bet('0xab', { from: user1, value: 4000000000000000 }));
            // transaction object {chainId, value, to, from, gas(Limit), gasPrice}
        })

        it('should put the bet to the queue with 1', async () => {
            // bet
            let receipt = await lottery.bet('0xab', {from : user1, value:betAmount});
            //console.log(receipt);
            
            let pot = await lottery.getPot();
            assert.equal(pot, 0);

            // check contract balance == 0.005
            // truffle 에서는 web3가 주입되어 있다.
            // web3 provider가 필요 없다.
            // 스마트 컨트랙트에 저장되어 있는 스마트 컨트랙트 balance 를 가져온다.
            let contractBalance = await web3.eth.getBalance(lottery.address);
            // 컨트랙트 밸런스는 배팅 금액과 같아야 한다
            assert.equal(contractBalance, betAmount) // betAmount = 5000000000000000


            //check bet info
            // 정답 블록 넘버를 가져온다.
            let currentBlockNumber = await web3.eth.getBlockNumber();

            // bet 이라는 변수에 lottery.getBetInfo(0) 을 대입
            // 첫번째 배팅이 queue 에 0번째 인덱스에 들어가 있음
            // function getBetInfo(uint256 index) public view returns (uint256 answerBlockNumber, address bettor, bytes1 challenges)
            // 0번째 배팅의 정답블록넘버, 베터 주소, 정답으로 제출한 답안 을 가져온다.
            let bet = await lottery.getBetInfo(0);
            

            // 같은지 확인
            // 제출한 블럭과 정답이 같은지
            assert.equal(bet.answerBlockNumber, currentBlockNumber + bet_block_interval); // answerBlockNumber 가 현재 주소 + 3 인지
            assert.equal(bet.bettor, user1); // user1 주소가 제대로 들어왔는지 , bettor 가 user1인지
            assert.equal(bet.challenges, '0xab')

            // check log
            //console.log(receipt);
            await expectEvent.inLogs(receipt.logs, 'BET')

        })
    })

    // function isMatch(bytes1 challenges, bytes32 answer) public pure returns (BettingResult)
    describe('isMatch', function () {
        // 정답 확인을 위한 임의의 블록해시 값 = 32 bytes
        let blockHash = '0xabec17438e4f0afb9cc8b77ce84bb7fd501497cfa9a1695095247daa5b4b7bcc'


        // 두글자 정답일 때
        it('should be BettingResult.Win when two characters match', async () => {

            // challenges 와 blockHash 의 앞 두글자를 비교
            let matchingResult = await lottery.isMatch('0xff', blockHash);

            assert.equal(matchingResult, 0);
        })

        // 베팅 실패
        it('should be BettingResult.Fail when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xcd', blockHash);
            assert.equal(matchingResult, 0);
        })

        // 무승부
        it('should be BettingResult.Draw when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xaf', blockHash);
            assert.equal(matchingResult, 2);

            matchingResult = await lottery.isMatch('0xfb', blockHash);
            assert.equal(matchingResult, 2);
        })

    })


    describe('Distribute', function () { 
        // 정답 체크 가능
        describe('When the answer is checkable', function () {

            // 두 글자 다 맞았을 때
            it.only('should give the user the pot when the answer matches', async () => { 
                await lottery.setAnswerForTest('0xabec17438e4f0afb9cc8b77ce84bb7fd501497cfa9a1695095247daa5b4b7bcc', {from:deployer})

                let potmoney1 = await lottery.getPot(); //  == 0
                console.log("transaction 1",potmoney1.toString())      

                //function betAndDistribute(bytes1 challenges) public payable returns (bool result)

                // 정답 틀림 -> 팟머니에 쌓임
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 1 -> 4에서 확인 가능
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 2 -> 5에서 확인 가능

                let potmoney2 = await lottery.getPot(); //  == 0
                console.log("transaction 2",potmoney2.toString())          

                // 정답 맞춤
                await lottery.betAndDistribute('0xab', {from:user1, value:betAmount}) // 3 -> 6

                let potmoney3 = await lottery.getPot(); //  == 0
                console.log("transaction 3",potmoney3.toString())          

                // 정답 틀림
                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 4 -> 7
                
                let potmoney4 = await lottery.getPot(); //  == 0
                console.log("transaction 4",potmoney4.toString())          

                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 5 -> 8

                let potmoney5 = await lottery.getPot(); //  == 0
                console.log("transaction 5",potmoney5.toString())           

                await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 6 -> 9

                let potmoney6 = await lottery.getPot(); //  == 0
                console.log("transaction 6",potmoney6.toString())     

                // // 여러번의 배팅과 분배 (bet And Distribute)

                // // 팟머니가 쌓임

                // // 정답을 맞춘 유저에게 팟머니 지급 -> 팟머니의 변화 확인

                // // user(Winner의 밸런스를 확인)

                // //------------------- before
                // // 팟머니의 잔고
                // let potBefore = await lottery.getPot(); //  == 0.01 ETH = 0.005 x 2

                // // user1 의 잔고
                // let user1BalanceBefore = await web3.eth.getBalance(user1);

                // // 7번 블록의 receipt
                // let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 7 -> 10 // user1 <- pot

                // // ------------------ after

                // let potAfter = await lottery.getPot(); // == 0.015 ETH
                // let user1BalanceAfter = await web3.eth.getBalance(user1); // == before
                
                // // pot 의 변화량 확인
                // assert.equal(potBefore.add(betAmountBN).toString(), potAfter.toString());

                // // user(winner)의 밸런스를 확인
                // user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                // assert.equal(user1BalanceBefore.toString(), new web3.utils.BN(user1BalanceAfter).toString())
                
                let potBefore = await lottery.getPot(); //  == 0.01 ETH
                let user1BalanceBefore = await web3.eth.getBalance(user1);
                
                let receipt7 = await lottery.betAndDistribute('0xef', {from:user2, value:betAmount}) // 7 -> 10 // user1에게 pot이 간다

                let potAfter = await lottery.getPot(); // == 0
                let user1BalanceAfter = await web3.eth.getBalance(user1); // == before + 0.015 ETH
                
                // pot 의 변화량 확인
                assert.equal(potBefore.toString(), new web3.utils.BN('10000000000000000').toString());
                assert.equal(potAfter.toString(), new web3.utils.BN('0').toString());

                // user(winner)의 밸런스를 확인
                user1BalanceBefore = new web3.utils.BN(user1BalanceBefore);
                assert.equal(user1BalanceBefore.add(potBefore).add(betAmountBN).toString(), new web3.utils.BN(user1BalanceAfter).toString())
                
            })

            // 한 글자만 맞았을 때
            it('should give the user the amount he or she bet when a single character matches', async () => {


            })

            // 다 틀렸을 때
            it('should get the eth of user when the answer does not match at all', async () => {

            })      
            
            // 정답 확인 불가
            // 아직 마이닝 되지 않았을 때
            describe('When the answer is not revealed(Not Mined)', function () {

            })
            // 확인 가능 블록을 지났을 때
            describe('When the answer is not revealed(Block limit is passed)', function () {
                //eth_mine
            })

        })
    })


});