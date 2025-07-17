// src/lib/web3/etherscan.ts
export function getEtherscanUrl(
  txHash: string,
  networkId: string = '11155111',
) {
  const baseUrls = {
    '1': 'https://etherscan.io',
    '11155111': 'https://sepolia.etherscan.io', // Sepolia testnet
  }

  const baseUrl =
    baseUrls[networkId as keyof typeof baseUrls] || baseUrls['11155111']
  return `${baseUrl}/tx/${txHash}`
}
