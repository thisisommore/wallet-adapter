import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Program, Provider, web3, BN } from '@project-serum/anchor'; //make sure to update dependency in package.json file
import React, { FC, ReactNode, useMemo } from 'react';
import idl from './idl.json';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.testnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/solana-labs/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({network}),
            new TorusWalletAdapter(),
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useAnchorWallet();
    const baseAccount = web3.Keypair.generate();
    
    function getProvider() {
        if (!wallet) {
            return null;
        }
     /* create the provider and return it to the caller */
     /* network set to local network for now */
        const network = "   "; //Enter localhost id here
        const connection = new Connection(network, "processed");
        
        const provider = new Provider(
            connection, wallet, {"preflightCommitment": "prpcessed"},
        );
        return provider;
    }
    
    async function createCounter() {
        const provider = getProvider()
        
        if(!provider) {
            throw("Provider is null");
        }
        // create the program interface combining the idl, program ID, and provider
        
        //Bug with default importing when handling string value types. Fix it by reconverting to json
        
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new program(b, idk.metadata,address, provider);
        
        try {
            //interact with the program via rpc
            await program.rpc.initialize({
                accounts: {
                    myAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [baseAccount]
            });
            
            
            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account: ', account);
        } catch(err) {
          console.log("Transaction error:", err);  
        }
    }
    
    async function increment() {
        const provider = getProvider()
        
        if(!provider) {
            throw("Provider is null");
        }
        // create the program interface combining the idl, program ID, and provider
        
        //Bug with default importing when handling string value types. Fix it by reconverting to json
        
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new program(b, idk.metadata,address, provider);
        
        try {
            //interact with the program via rpc
            await program.rpc.increment({
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });
            
            
            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account data: ', account.data.toString());
        } catch(err) {
          console.log("Transaction error:", err);  
        }
    }
    
    //expected to do it for decrement and update
    
    return (
        <div className="App">
            <button onClick={createCounter}>Initialize</ button>
            <button>Update</ button>
            <button onClick={increment}>Increment</ button>
            <button>Decrement</ button>
            <WalletMultiButton />
        </div>
    );
};
