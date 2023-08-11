import React, { useEffect } from 'react'; 

import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';

const lotteryAddress = '0x971719be3e765C16BE98fb18d3570AeD099403E2';
const lotteryABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "BET", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "DRAW", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "FAIL", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "REFUND", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "index", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bettor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "indexed": false, "internalType": "bytes1", "name": "answer", "type": "bytes1" }, { "indexed": false, "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" } ], "name": "WIN", "type": "event" }, { "inputs": [], "name": "answerForTest", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "getPot", "outputs": [ { "internalType": "uint256", "name": "pot", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "betAndDistribute", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "name": "bet", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "payable", "type": "function", "payable": true }, { "inputs": [], "name": "distribute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "setAnswerForTest", "outputs": [ { "internalType": "bool", "name": "result", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes1", "name": "challenges", "type": "bytes1" }, { "internalType": "bytes32", "name": "answer", "type": "bytes32" } ], "name": "isMatch", "outputs": [ { "internalType": "enum Lottery.BettingResult", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "getBetInfo", "outputs": [ { "internalType": "uint256", "name": "answerBlockNumber", "type": "uint256" }, { "internalType": "address", "name": "bettor", "type": "address" }, { "internalType": "bytes1", "name": "challenges", "type": "bytes1" } ], "stateMutability": "view", "type": "function", "constant": true } ];
const betmoney = '5000000000000000'; // 문자열로 변경

function App() {

  useEffect(() => {
    // 컴포넌트가 마운트된 후 실행되는 코드
    // 컴포넌트가 랜더링 될 때마다 실행된다.
    async function initWeb3() {
      try {
        // 브라우저가 메타마스크를 지원하는지 확인
        if (window.ethereum) {
          console.log('최신 모드');
          // 이더리움 프로바이더 설정
          // 최신 모드에서는 window.ethereum.request를 사용하여 계정 접근권한 요청 가능
          window.web3 = new Web3(window.ethereum);

          // metamask 계정 접근 권한 요청
          await window.ethereum.request({ method: 'eth_requestAccounts' });

        } else if (window.web3) {
          console.log('레거시 모드');
          window.web3 = new Web3(window.web3.currentProvider);
        } else {
          console.log('이더리움 브라우저가 아닙니다. MetaMask를 시도해보세요!');
          return;
        }

        let accounts = await window.web3.eth.getAccounts();
        window.account = accounts[0];

        // lotteryContract 생성
        const lotteryContract = new window.web3.eth.Contract(lotteryABI, lotteryAddress);

        let owner = await lotteryContract.methods.owner().call();
        console.log('Owner:', owner);

        let pot = await lotteryContract.methods.getPot().call();
        console.log('Pot:', pot);


        //await bet();
        // bet = async () => {
        // // 특정 adress가 그동안 몇개의 transaction을 만들었는가
        // // 트랜잭션 반복 방지
        // // 트랜잭션 보안
          let nonce = await window.web3.eth.getTransactionCount(window.account);
          await lotteryContract.methods.betAndDistribute('0xcd').send({
            from: window.account,
            value: betmoney
            ,nonce: nonce,
          });
          let pot2 = await lotteryContract.methods.getPot().call();

          console.log('Pot:', pot2);

        // }
      } catch (error) {
        console.error('오류 발생:', error);
      }
    }

    // initWeb3 함수 호출하여 Ethereum 관련 초기화 작업 수행
    initWeb3();

    // return () => {
    //   // 컴포넌트가 언마운트되거나 업데이트되기 직전에 실행되는 코드 (cleanup)
    // };

    // useEffect의 두 번째 인자로 전달되는 배열 ([])은 "의존성 배열" 또는 "의존성 리스트"라고 불림
    // 주로 컴포넌트가 최초로 렌더링될 때 초기화 작업이나 데이터 가져오기 등을 수행할 때 사용
  }, []);

  // bet 함수 선언

  // const bet = async () => {
  //   try {
  //     // 특정 adress가 그동안 몇개의 transaction을 만들었는가
  //     // 트랜잭션 반복 방지
  //     // 트랜잭션 보안
  //     let nonce = await window.web3.eth.getTransactionCount(window.account);
  //     await lotteryContract.methods.betAndDistribute('0xcd').send({
  //       from: window.account,
  //       value: betmoney,
  //       nonce: nonce,
  //     });
  //   } catch (error) {
  //     console.error('베팅 오류:', error);
  //   }
  // };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          소스 코드를 편집하고 <code>src/App.js</code> 파일을 저장하여 다시 로드하세요.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          React 배우기
        </a>
      </header>
    </div>
  );
}

export default App;
