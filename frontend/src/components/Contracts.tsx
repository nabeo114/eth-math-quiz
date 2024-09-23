import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, IconButton, Tooltip, Alert } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useMetamask } from '../contexts/MetamaskContext';
import { useContracts } from '../contexts/ContractContext';

const Contracts: React.FC = () => {
  const { provider } = useMetamask();
  const { contract, loadContracts, error: contractsError } = useContracts();
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopyAddress = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
    }
  };

  const fetchContractDetails = async () => {
    setError(null);
    try {
      if (contract) {
        setContractAddress(await contract.getAddress());
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error fetching contract details:', errorMessage);
      setError(errorMessage);
    }
  }

  const handleLoadContracts = async () => {
    setError(null);
    try {
      await loadContracts(provider);
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error loading contracts:', errorMessage);
      setError(errorMessage);
    } finally {
    }
  };

  useEffect(() => {
    if (provider) {
      handleLoadContracts();
    }
  }, [provider]);

  useEffect(() => {
    if (contract) {
      fetchContractDetails();
    }
  }, [contract]);

  return (
    <>
      {contract && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {contract && (
              <Typography variant="body1" color="textSecondary">
                Contract Address: <Typography component="span" variant="h6" color="textPrimary">
                  {contractAddress}
                  <Tooltip title="Copy to clipboard" placement="top">
                    <IconButton
                      aria-label="copy wallet address"
                      onClick={handleCopyAddress}
                      edge="end"
                      sx={{ ml: 1 }}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      {(contractsError || error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {contractsError || error}
        </Alert>
      )}
    </>
  );
}

export default Contracts;
