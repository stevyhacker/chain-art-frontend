import {Contract} from "@ethersproject/contracts";
import React, {useEffect, useState} from "react";
import ImageUploading from "react-images-uploading";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGlobe, faImage, faLink} from '@fortawesome/free-solid-svg-icons'
import {Body, Button, Header, Link, SmallLink} from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";
import {css} from "@emotion/react";
import ClockLoader from "react-spinners/ClockLoader";
import '@rainbow-me/rainbowkit/styles.css';

import {
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
    chain,
    configureChains,
    createClient,
    WagmiConfig,
} from 'wagmi';
import {alchemyProvider} from 'wagmi/providers/alchemy';
import {publicProvider} from 'wagmi/providers/public';
import {ConnectButton} from '@rainbow-me/rainbowkit';

import {addresses, abis} from "@project/contracts";
import Content from "./components/Content";
import Footer from "./components/Footer";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
`;

function WalletButton({provider, loadWeb3Modal, logoutOfWeb3Modal}) {
    const [account, setAccount] = useState("");
    const [rendered, setRendered] = useState("");
    const [chain, setChain] = useState("");

    useEffect(() => {
        async function fetchAccount() {
            try {
                if (!provider) {
                    return;
                }

                // Load the user's accounts.
                const accounts = await provider.listAccounts();
                setAccount(accounts[0]);

                // Resolve the ENS name for the first account.

                const network = await provider.getNetwork();
                const networkName = network.name;
                // const chainId = await provider.getNetwork().getChainId();
                // console.log("Chain from ENV: " + process.env.REACT_APP_NETWORK);
                // console.log("Account: : " + account);

                // Render either the ENS name or the shortened account address.
                // try {
                //     const name = await provider.lookupAddress(accounts[0]);
                //     setRendered(name);
                // } catch (e) {
                setRendered(account.substring(0, 6) + "..." + account.substring(36));
                // }
                setChain(" : " + networkName);
            } catch (err) {
                setAccount("");
                setRendered("");
                console.error(err);
            }
        }

        fetchAccount();
    }, [account, provider, setAccount, setRendered, setChain]);

    return (
        <div>
            {chain !== undefined && chain !== " : " + process.env.REACT_APP_NETWORK ?
                <SmallLink
                    href="https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/"
                    className="polygon-warning">Please use Polygon network
                </SmallLink> : null}
            <Button className="topbar"
                    onClick={() => {
                        if (!provider) {
                            loadWeb3Modal();
                        } else {
                            logoutOfWeb3Modal();
                        }
                    }}>
                {rendered === "" && "Connect Wallet"}
                {rendered !== "" && rendered} {chain}
            </Button>
            <ConnectButton/>
        </div>

    );
}

function App() {
    let [loading, setLoading] = useState(false);
    let [transactionInProgress, setTransactionInProgress] = useState();

    const [provider2, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

    const {chains, provider} = configureChains(
        [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
        [
            alchemyProvider({alchemyId: process.env.ALCHEMY_ID}),
            publicProvider()
        ]
    );

    const {connectors} = getDefaultWallets({
        appName: 'Chain Art',
        chains
    });

    const wagmiClient = createClient({
        autoConnect: true,
        connectors,
        provider
    })

    const [images, setImages] = React.useState([]);
    const onChange = (imageList) => {
        setImages(imageList);
    };

    async function checkForConfirmation(tx) {
        console.log("Transaction hash: " + tx.hash);
        setTransactionInProgress(tx.hash);
        const txReceipt = await provider.getTransactionReceipt(tx.hash);

        if (txReceipt && txReceipt.blockNumber) {
            console.log("Transaction mined: " + txReceipt.blockNumber);
            return txReceipt;
        }
    }

    async function mintArt(provider, imageData, callback) {
        const signer = provider.getSigner();
        // Create an instance of an ethers.js Contract
        let chainArtContract = new Contract(addresses.chainArtPolygon, abis.chainArt, provider);
        const network = await provider.getNetwork();
        if (network.name === "rinkeby") {
            chainArtContract = new Contract(addresses.chainArtRinkeby, abis.chainArt, provider);
        }

        // signer.getAddress().then(r => console.log("User account: " + r));
        const mintPrice = await chainArtContract.mintPrice();
        // console.log("Balance before: " + await provider.getBalance(signer.getAddress()));

        // chainArtContract.on("CreatedChainArtNFT", (tokenId) => {
        //     console.log(`Token #${tokenId} minted`);
        //     setLoading(false)
        // });

        const tx = await chainArtContract.connect(signer).createFromBase64(imageData.toString(), {
            value: mintPrice,
        });

        callback();
        setLoading(!loading);
        await checkForConfirmation(tx);

        clearData();
        // console.log("Balance after: " + await provider.getBalance(signer.getAddress()));
        // console.log(`You can view the tokenURI here ${await chainArtContract.tokenURI(0)}`);
    }

    function clearData() {
        setLoading(false);
        setTransactionInProgress("");
    }

    function uploadArtBtn(provider, imageData, callback) {

        // console.log("Image data: " + imageData);

        if (provider !== undefined) {
            mintArt(provider, imageData, callback);
        } else {
            loadWeb3Modal().then(pr => mintArt(pr, imageData, callback));
        }
    }

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <div>
                    <Header>
                        <div>
                            <WalletButton provider={provider2} loadWeb3Modal={loadWeb3Modal}
                                          logoutOfWeb3Modal={logoutOfWeb3Modal}/>
                            <ConnectButton/>
                        </div>
                    </Header>
                    <Body>
                        <div className="app">

                            <Content/>

                            <ImageUploading
                                value={images}
                                onChange={onChange}
                                maxFileSize={20480}
                                dataURLKey="data_url">
                                {({
                                      imageList,
                                      onImageUpload,
                                      onImageRemoveAll,
                                      isDragging,
                                      dragProps,
                                      errors
                                  }) => (
                                    <div>
                                        <div className="upload__image-wrapper">
                                            <Button
                                                style={isDragging ? {color: "#2c3e9a"} : null}
                                                onClick={() => {
                                                    onImageUpload();
                                                    clearData();
                                                }}
                                                {...dragProps} >
                                                <FontAwesomeIcon icon={faImage} size={"lg"}/> <br/>
                                                <br/>
                                                {isDragging ? "Drop Image here" : "Pick or Drag an Image here"}
                                            </Button>
                                            <br/>
                                            <br/>
                                            {imageList.map((image, index) => (
                                                <div key={index} className="image-item">
                                                    <img src={image.data_url} alt="" width="150"/>
                                                    <div className="image-item__btn-wrapper">
                                                        <Button className="fas fa-image"
                                                                onClick={() => {
                                                                    uploadArtBtn(provider, image.data_url, onImageRemoveAll);
                                                                }}>
                                                            <FontAwesomeIcon icon={faGlobe} size={"lg"}/> <br/><br/>
                                                            Upload Art
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {errors && errors.maxFileSize &&
                                            <p className={"error-warning"}>Selected file size exceeds allowed size!</p>}
                                    </div>
                                )}
                            </ImageUploading>

                            <div className="sweet-loading">
                                {loading ? <h5 style={{marginBottom: "1.5rem"}}>Minting NFT…</h5> : ""}
                                <ClockLoader color="#fff" loading={loading} css={override} size={100}/>
                                {transactionInProgress && <p className={"transaction"}>Click here for progress: <br/>
                                    <SmallLink href={"https://polygonscan.com/tx/" + transactionInProgress}>
                                        {transactionInProgress.substring(0, 8)}...{transactionInProgress.substring(60)}
                                    </SmallLink></p>}
                            </div>
                        </div>
                        <Footer/>
                    </Body>
                </div>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;
