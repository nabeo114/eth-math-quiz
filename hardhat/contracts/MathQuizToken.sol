// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MathQuizToken is ERC20, Ownable {
    struct Equation {
        int8 operand1;
        int8 operand2;
        uint8 operation; // 0: add, 1: subtract, 2: multiply
        int result;
    }

    Equation private currentEquation;
    bool public gameActive;

    event GameStarted(string equation);
    event GuessResult(string message, bool success);

    constructor(address initialOwner)
        ERC20("MathQuizToken", "MQK")
        Ownable(initialOwner)
    {
        gameActive = false;
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 新しいゲームを開始する
    function _startNewGame() private {
        gameActive = true;
        currentEquation = _generateRandomEquation();
        string memory equationString = _getEquationString(currentEquation);
        emit GameStarted(equationString);
    }

    // ランダムな計算式を生成
    function _generateRandomEquation() private view returns (Equation memory) {
        // int8に変換する前にint256にキャストしてからint8にキャストする
        int8 operand1 = int8(int256(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 10 + 1));
        int8 operand2 = int8(int256(uint256(keccak256(abi.encodePacked(block.timestamp, block.number))) % 10 + 1));
        uint8 operation = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1)))) % 3); // 0: add, 1: subtract, 2: multiply


        int result;
        if (operation == 0) {
            result = operand1 + operand2;
        } else if (operation == 1) {
            result = operand1 - operand2;
        } else {
            result = operand1 * operand2;
        }

        return Equation(operand1, operand2, operation, result);
    }

    // 計算式を文字列として返す
    function _getEquationString(Equation memory equation) private pure returns (string memory) {
        string memory operatorSymbol;
        if (equation.operation == 0) {
            operatorSymbol = "+";
        } else if (equation.operation == 1) {
            operatorSymbol = "-";
        } else {
            operatorSymbol = "*";
        }

        return string(abi.encodePacked(
            int2str(equation.operand1),
            " ",
            operatorSymbol,
            " ",
            int2str(equation.operand2)
        ));
    }

    // プレイヤーが答えを送信
    function guess(int answer) public {
        require(gameActive, "Game is not active");
        
        if (answer == currentEquation.result) {
            gameActive = false;
            emit GuessResult("Correct! You win!", true);

            // オーナーからプレイヤーにトークンを転送
            uint256 rewardAmount = 10 * 10 ** decimals(); // 報酬の量を設定
            require(balanceOf(owner()) >= rewardAmount, "Owner does not have enough tokens");
            _transfer(owner(), msg.sender, rewardAmount);
        } else {
            emit GuessResult("Incorrect, try again.", false);
        }
    }

    // 新しいゲームを開始するための関数
    function startNewGame() public {
        _startNewGame();
    }

    // intをstringに変換
    function int2str(int _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        int j = _i;
        uint len;
        bool negative = false;
        if (_i < 0) {
            negative = true;
            j = -j;
        }
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len + (negative ? 1 : 0));
        uint k = len + (negative ? 1 : 0);
        j = _i < 0 ? -_i : _i;
        while (j != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(uint256(j - (j / 10) * 10)));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            j /= 10;
        }
        if (negative) {
            bstr[0] = '-';
        }
        return string(bstr);
    }
}
