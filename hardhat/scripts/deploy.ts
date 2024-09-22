import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

// コントラクト情報を保存するディレクトリのパス
// ディレクトリが存在しない場合は作成する
const dataDirectory = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// コントラクト情報ファイルのパス
const contractFilePath = path.join(__dirname, '..', 'data', 'contracts.json');

// コントラクトをデプロイする関数
async function deployContract(contractName: string) {
  try {
    console.log(`[INFO] Starting deployment of ${contractName}...`);

    const signer = await ethers.provider.getSigner();

    // コントラクトをデプロイ
    const contract = await ethers.deployContract(contractName, [signer.address]);
    console.log(`[INFO] Contract deployment transaction sent for ${contractName}.`);

    // デプロイ完了まで待機
    await contract.waitForDeployment();
    console.log(`[INFO] Contract ${contractName} deployed.`);

    // トランザクションレシートを取得
    const txReceipt = await contract.deploymentTransaction()!.wait();
    console.log(`[INFO] ${contractName} contract address: ${txReceipt!.contractAddress}`);
    console.log(`[INFO] ${contractName} transaction hash: ${txReceipt!.hash}`);

    return { signer, contract, txReceipt };
  } catch (error: any) {
    throw new Error(`Failed to deploy ${contractName} contract: ${error.message}`);
  }
}

// メイン処理
async function main() {
  try {
    // ファイルをチェックして、コントラクトが既に存在するかを確認
    if (fs.existsSync(contractFilePath)) {
      throw new Error('Contracts already exist in the file');
    }

    // コントラクトをデプロイ
    const { signer, contract } = await deployContract('MathQuizToken');
    const signerAddress = signer.address;
    const contractAddress = await contract.getAddress();
    const contractABI = contract.interface.formatJson();
    console.log(`[INFO] Contract address: ${contractAddress}`);

    // デプロイされたアドレスをJSONファイルに保存
    const contractData = {
      signerAddress, contractAddress, contractABI
    };
    await fs.promises.writeFile(contractFilePath, JSON.stringify(contractData, null, 2));
    console.log(`[INFO] Contract data saved to ${contractFilePath}`);
  } catch (error: any) {
    console.error('Error in main():', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error.message);
    process.exit(1);
  });
