import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import contracts from '../../../hardhat/data/contracts.json';

interface ContractContextType {
  contract: ethers.Contract | null;
  loadContracts: (provider: ethers.Provider | null) => Promise<void>;
  error: string | null;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
};

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContracts = async (provider: ethers.Provider | null) => {
    setError(null);
    try {
      if (!provider) {
        throw new Error('Provider is required to connect contracts');
      }

      if (contracts) {
        // コントラクトのインスタンスを作成
        const contract = new ethers.Contract(
          contracts.contractAddress,
          JSON.parse(contracts.contractABI),
          provider
        );
        setContract(contract);
      } else {
        throw new Error('Contracts data is missing');
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <ContractContext.Provider value={{ contract, loadContracts, error }}>
      {children}
    </ContractContext.Provider>
  );
};