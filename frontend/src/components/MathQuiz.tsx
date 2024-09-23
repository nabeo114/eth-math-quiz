import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, Button, Typography, TextField, Tooltip, CircularProgress, Alert } from '@mui/material';
import { useMetamask } from '../contexts/MetamaskContext';
import { useContracts } from '../contexts/ContractContext';

const MathQuiz: React.FC = () => {
  const { signer } = useMetamask();
  const { contract } = useContracts();
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<number>(0);
  const [guessLoading, setGuessLoading] = useState(false);
  const [guessError, setGuessError] = useState<string | null>(null);
  const [gameStartedMessage, setGameStartedMessage] = useState<string | null>(null);
  const [guessResultMessage, setGuessResultMessage] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // ERC20トークン残高を取得
  const fetchTokenBalance = async () => {
    setTokenError(null);
    try {
      if (signer && contract) {
        const address = await signer.getAddress();

        const tokenBalance = await contract.balanceOf(address);
        setTokenBalance(ethers.formatEther(tokenBalance));
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching token balance:', errorMessage);
      setTokenError(errorMessage);
    }
  }

  // ゲームの開始処理
  const handleStartNewGame = async () => {
    setAnswer(0);
    setGameStartedMessage(null);
    setGuessResultMessage(null);
    setStartError(null);
    setStartLoading(true);
    try {
      if (!contract) {
        setStartError('Contract is required to start game');
        return;
      }

      const tx = await contract.startNewGame();
      console.log('Transaction sent, waiting for confirmation...');
      await tx.wait();
      console.log('Transaction confirmed');
      console.log('Started new game');
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error starting new game:', errorMessage);
      setStartError(errorMessage);
    } finally {
      setStartLoading(false);
    }
  }

  // 回答の推測処理
  const handleGuess = async () => {
    setGuessError(null);
    setGuessLoading(true);
    try {
      if (!contract) {
        setGuessError('Contract is required to guess the answer');
        return;
      }

      const tx = await contract.guess(answer);
      console.log('Transaction sent, waiting for confirmation...');
      await tx.wait();
      console.log('Transaction confirmed');
      console.log(`Guessed the answer as ${answer}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error guessing the answer:', errorMessage);
      setGuessError(errorMessage);
    } finally {
      setGuessLoading(false);
    }
  }

  // 
  useEffect(() => {
    if (signer && contract) {
      fetchTokenBalance();
    }
  }, [signer, contract]);

  // GameStartedイベントを監視
  useEffect(() => {
    if (!contract) return;

    const monitorGameStartedEvents = async () => {
      try {
        const infuraApiKey = process.env.INFURA_API_KEY;
        if (!infuraApiKey) {
          throw new Error('INFURA_API_KEY is not defined in environment variables');
        }

        const socketProviderUrl = `wss://polygon-amoy.infura.io/ws/v3/${infuraApiKey}`;
        const socketProvider = new ethers.WebSocketProvider(socketProviderUrl);

        const filter = {
          address: contract.getAddress(),
          topics: [ethers.id("GameStarted(string)")]
        };

        // イベントの監視
        socketProvider.on(filter, (log) => {
          console.log("GameStarted event detected:", log);
  
          const abiCoder = new ethers.AbiCoder();
          const decodedData = abiCoder.decode(["string"], log.data);
          const gameMessage = decodedData[0];
          console.log("Decoded game message:", gameMessage);

          setGameStartedMessage(gameMessage);
        });

        return () => {
          socketProvider.off(filter);
          if (socketProvider) socketProvider.destroy();
        };
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('Error monitoring GameStarted events:', errorMessage);
        setStartError(errorMessage);
      }
    };

    monitorGameStartedEvents();
  }, [contract]);

  // GuessResultイベントを監視
  useEffect(() => {
    if (!contract) return;

    const monitorGuessResultEvents = async () => {
      try {
        const infuraApiKey = process.env.INFURA_API_KEY;
        if (!infuraApiKey) {
          throw new Error('INFURA_API_KEY is not defined in environment variables');
        }

        const socketProviderUrl = `wss://polygon-amoy.infura.io/ws/v3/${infuraApiKey}`;
        const socketProvider = new ethers.WebSocketProvider(socketProviderUrl);

        const filter = {
          address: contract.getAddress(),
          topics: [ethers.id("GuessResult(string,bool)")]
        };

        // イベントの監視
        socketProvider.on(filter, (log) => {
          console.log("GuessResult event detected:", log);

          const abiCoder = new ethers.AbiCoder();
          const decodedData = abiCoder.decode(["string", "bool"], log.data);
          const gameMessage = decodedData[0];
          console.log("Decoded game message:", gameMessage);

          // Reactのstateに保存して画面に表示
          setGuessResultMessage(gameMessage);

          fetchTokenBalance();
        });

        return () => {
          socketProvider.off(filter);
          if (socketProvider) socketProvider.destroy();
        };
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('Error monitoring GuessResult events:', errorMessage);
        setGuessError(errorMessage);
      }
    };

    monitorGuessResultEvents();
  }, [contract]);


  return (
    <>
      {tokenBalance && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="textSecondary">
              Token Balance: <Typography component="span" variant="h6" color="textPrimary">
                {tokenBalance}
              </Typography>
            </Typography>
            {tokenError && <Alert severity="error" sx={{ mt: 2 }}>{tokenError}</Alert>}
          </CardContent>
        </Card>
      )}
      {contract && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Button variant="contained" color="primary" onClick={handleStartNewGame} sx={{ mt: 2 }} disabled={startLoading || guessLoading}>
              {startLoading ? <CircularProgress size={24} /> : 'Start New Game'}
            </Button>
            {gameStartedMessage && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="h6" color="textSecondary">
                  Question: {gameStartedMessage} = ?
                </Typography>
              </Alert>
            )}
            {startError && <Alert severity="error" sx={{ mt: 2 }}>{startError}</Alert>}

            {(gameStartedMessage && !startLoading) && (
              <>
                <Tooltip title="Please enter the answer you guess." placement="top" arrow>
                  <TextField
                    label="Answer"
                    value={answer}
                    onChange={(e) => setAnswer(Number(e.target.value))}
                    fullWidth
                    sx={{ mt: 3 }}
                    type="number"
                  />
                </Tooltip>

                <Button variant="contained" color="primary" onClick={handleGuess} sx={{ mt: 2 }} disabled={guessLoading}>
                  {guessLoading ? <CircularProgress size={24} /> : 'Guess the Answer'}
                </Button>

                {guessResultMessage && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="h6" color="textSecondary">
                      Result: {guessResultMessage}
                    </Typography>
                  </Alert>
                )}
                {guessError && <Alert severity="error" sx={{ mt: 2 }}>{guessError}</Alert>}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default MathQuiz;
