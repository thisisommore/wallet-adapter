import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { UnsafeBurnerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { Program, web3, BN, Provider, AnchorProvider } from '@project-serum/anchor'; //make sure to update dependency in package.json file
import React, { FC, ReactNode, useMemo, useState } from 'react';
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
    const network = WalletAdapterNetwork.Testnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
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
    const [baseAccount] = useState(web3.Keypair.generate());
    
    function getProvider() {
        if (!wallet) {
            return null;
        }
        
     /* create the provider and return it to the caller */
     /* network set to local network for now */
        const network = "http://localhost:8899"; //Enter localhost id here
        const connection = new Connection(network, "processed");
        const provider = new AnchorProvider(
            connection, wallet, {preflightCommitment:"processed"},
        );
        return provider;
    }

    const [modalActive,setModalActive]=useState(false)
    const [value,setValue]= useState(0)
    
    async function createCounter() {
        const provider = getProvider()
        
        if(!provider) {
            throw("Provider is null");
        }
        // create the program interface combining the idl, program ID, and provider
        
        //Bug with default importing when handling string value types. Fix it by reconverting to json
        
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        console.log(baseAccount.publicKey.toBase58());
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
            
            const account = await program.account.counterData.fetch(baseAccount.publicKey);
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
        const program = new Program(b, idl.metadata.address, provider);
        
        try {
            //interact with the program via rpc
            await program.rpc.increment({
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });
        console.log(baseAccount.publicKey.toBase58());
            
            
            const account = await program.account.counterData.fetch(baseAccount.publicKey);
            console.log('account data: ', (account as any).value.toString());
        } catch(err) {
          console.log("Transaction error:", err);  
        }
    }

    async function decrement() {
        const provider = getProvider()
        
        if(!provider) {
            throw("Provider is null");
        }
        // create the program interface combining the idl, program ID, and provider
        
        //Bug with default importing when handling string value types. Fix it by reconverting to json
        
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        
        try {
            //interact with the program via rpc
            await program.rpc.decrement({
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });
            
            
            const account = await program.account.counterData.fetch(baseAccount.publicKey);
            console.log('account data: ', (account as any).value.toString());
        } catch(err) {
          console.log("Transaction error:", err);  
        }
    }

    async function update() {
        const provider = getProvider()
        
        if(!provider) {
            throw("Provider is null");
        }
        // create the program interface combining the idl, program ID, and provider
        
        //Bug with default importing when handling string value types. Fix it by reconverting to json
        
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        console.log(baseAccount.publicKey.toBase58());
        
        try {
            //interact with the program via rpc
            await program.rpc.update(value,{
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });
            
            
            const account = await program.account.counterData.fetch(baseAccount.publicKey);
            console.log('account data: ', (account as any).value.toString());
        } catch(err) {
          console.log("Transaction error:", err);  
        }
    }
    
    //expected to do it for decrement and update
    
    return (
        <div className="App">
           {modalActive&& <div className="modal">
                <input type="number" value={value} placeholder='Value' onChange={(e)=>setValue(+e.target.value)}/>
                <button onClick={update}>Update</button>
                <button onClick={()=>setModalActive(false)}>Close</button>
            </div>}
            <button onClick={createCounter}>Initialize</ button>
            <button onClick={()=>setModalActive(true)}>Update</ button>
            <button onClick={increment}>Increment</ button>
            <button onClick={decrement}>Decrement</ button>
            <WalletMultiButton />
        </div>
    );
};
