import { useEffect, useState, useMemo } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  IProvider,
  UX_MODE,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { AuthAdapter } from "@web3auth/auth-adapter";
import "./App.css";
// import RPC from './evm.web3';
import RPC from "./evm.viem";
// import RPC from "./evm.ethers";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletConnect } from "./walletConnect";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
const clientId =
  "BOL99KcIx-1Ae5DNJ8IzsygwuIeuVwccksAz5ghNaEPTwXBorHh0t20jivw1nDYaE1txI8r6GXuZ1ZHZKavCFv4"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(false);
  // 设置连接到 Solana 网络
  const network = clusterApiUrl("mainnet-beta");

  // 配置 Phantom 钱包适配器
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x1", // Please use 0x1 for Mainnet
          rpcTarget: "https://rpc.ankr.com/eth",
          displayName: "Ethereum Mainnet",
          blockExplorerUrl: "https://etherscan.io/",
          ticker: "ETH",
          tickerName: "Ethereum",
          logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3auth = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        const authAdapter = new AuthAdapter({
          adapterSettings: {
            uxMode: UX_MODE.REDIRECT,
            loginConfig: {
              jwt: {
                verifier: "w3a-node-demo",
                typeOfLogin: "jwt",
                clientId,
              },
            },
          },
        });
        web3auth.configureAdapter(authAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const getIdToken = async () => {
    // Get ID Token from server
    const res = await fetch("http://localhost:8080/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data?.token;
  };
  const getIdTokenWithSign = async (
    address: any,
    message: any,
    signMes: any
  ) => {
    // Get ID Token from server
    const res = await fetch("http://localhost:8080/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: address,
        message: message,
        signature: signMes,
      }),
    });
    const data = await res.json();
    return data?.token;
  };
  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await getIdToken();
    console.log(idToken);

    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: "jwt",
      extraLoginOptions: {
        id_token: idToken,
        verifierIdField: "sub",
        domain: "http://localhost:3000",
      },
    });
    setProvider(web3authProvider);
  };
  const loginWithSign = async (address: any, message: any, signMes: any) => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await getIdTokenWithSign(address, message, signMes);
    console.log(idToken);

    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: "jwt",
      extraLoginOptions: {
        id_token: idToken,
        verifierIdField: "sub",
        domain: "http://localhost:3000",
      },
    });
    setProvider(web3authProvider);
  };
  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setLoggedIn(false);
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    uiConsole(userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signMessage();
    uiConsole(result);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.sendTransaction();
    uiConsole(result);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loginView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            ChainID
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Account Address
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const signAndPost = async (
    publickey: any,
    message: any,
    signMessage: any
  ) => {
    console.log("prepare to post", publickey, message, signMessage);
    await loginWithSign(publickey, message, signMessage);
  };
  const logoutView = (
    // <button onClick={login} className="card">
    //   Login
    // </button>
    <WalletConnect signAndPost={signAndPost} />
  );
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="container">
            <h1 className="title">
              <a
                target="_blank"
                href="https://web3auth.io/docs/sdk/pnp/web/no-modal"
                rel="noreferrer"
              >
                Web3Auth
              </a>{" "}
              & React-Express Custom JWT Login
            </h1>

            <div className="grid">{loggedIn ? loginView : logoutView}</div>

            <footer className="footer">
              <a
                href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-no-modal-sdk/custom-authentication/single-verifier-examples/custom-jwt-no-modal-example"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code
              </a>
              <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeb3Auth%2Fweb3auth-pnp-examples%2Ftree%2Fmain%2Fweb-no-modal-sdk%2Fcustom-authentication%2Fsingle-verifier-examples%2Fauth0-no-modal-example&project-name=w3a-custom-jwt-no-modal&repository-name=w3a-custom-jwt-no-modal">
                <img src="https://vercel.com/button" alt="Deploy with Vercel" />
              </a>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
