import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletConnect = ({ signAndPost }) => {
  const wallet = useWallet();
  const signMessage = async () => {
    if (!wallet.connected || !wallet.signMessage) {
      console.error("Wallet not connected or does not support message signing");
      return;
    }

    const message = "Hello, World!";
    const encodedMessage = new TextEncoder().encode(message);
    try {
      const signature = await wallet.signMessage(encodedMessage);
      console.log("Signature:", signature);
      console.log("Encoded Message:", encodedMessage);
      signAndPost(wallet.publicKey.toString(), message, signature);
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };
  const handleDisconnect = () => {
    if (wallet.disconnect) {
      wallet.disconnect();
    }
  };
  return (
    <div>
      <WalletMultiButton />
      {wallet.publicKey && <button onClick={signMessage}>sign message</button>}
      {wallet.connected && (
        <button onClick={handleDisconnect}>Disconnect Wallet</button>
      )}
      {wallet.publicKey && (
        <p>Connected with public key: {wallet.publicKey.toString()}</p>
      )}
    </div>
  );
};
