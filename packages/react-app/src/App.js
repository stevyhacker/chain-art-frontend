import {Contract} from "@ethersproject/contracts";
import React, {useEffect, useState} from "react";
import ImageUploading from "react-images-uploading";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGlobe, faImage, faLink} from '@fortawesome/free-solid-svg-icons'
import {Body, Button, Header, Link, SmallLink} from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";
import {css} from "@emotion/react";
import ClockLoader from "react-spinners/ClockLoader";

import {addresses, abis} from "@project/contracts";

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
        </div>

    );
}

function App() {
    let [loading, setLoading] = useState(false);
    let [transactionInProgress, setTransactionInProgress] = useState();

    const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

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
        if(network.name === "rinkeby"){
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
        <div>
            <Header>
                <div>
                    <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal}
                                  logoutOfWeb3Modal={logoutOfWeb3Modal}/>
                </div>
            </Header>
            <Body>
                <div className="app">

                    <h2>On-chain Art NFT Minter (???,????)</h2>

                    <p className={"description"} style={{marginBottom: "50px"}}>
                        Why on-chain minting?
                        <br/>
                        Because NFTs today store data on servers or IPFS which are in no way related to the blockchain which hosts NFTs.
                        <br/>
                        Here the images will be saved on-chain in base64 encoding and an NFT will be minted for you.
                        <br/>
                        You can get the metadata and art straight from Polygonscan.
                        <br/>
                        <br/>
                        Image file size is limited to under 20 kb right now.
                        For the best quality, upload images in SVG format.
                        <br/>
                        Other formats will take more space and require more gas == more expensive transactions.
                        <br/>
                        <br/>
                        Protocol has a minting fee of 1 MATIC per NFT.
                        <br/>
                        Upload your image here and confirm the transaction.
                        <br/>
                        After the transaction is mined you can see the NFT on your wallet on OpenSea.

                    </p>

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
                        {loading ? <h5 style={{marginBottom: "1.5rem"}}>Minting NFT???</h5> : ""}
                        <ClockLoader color="#fff" loading={loading} css={override} size={100}/>
                        {transactionInProgress && <p className={"transaction"}>Click here for progress: <br/>
                            <SmallLink href={"https://polygonscan.com/tx/" + transactionInProgress}>
                                {transactionInProgress.substring(0, 8)}...{transactionInProgress.substring(60)}
                            </SmallLink></p>}
                    </div>

                </div>

                <p style={{marginTop: "160px"}}><FontAwesomeIcon icon={faLink}/> Links:</p>

                <Link href="https://opensea.io/collection/chain-art-1">
                    OpenSea Collection
                </Link>
                ----
                {/*<Link href="https://rinkeby.etherscan.io/address/0xf9138253be75937ba37a553c7154034259368009">*/}
                <Link href="https://polygonscan.com/address/0x4adff2f8da3fcdc80dc2f1e6f32c2b26baa27048#code">
                    Contract
                </Link>
                ----
                <Link style={{marginBottom: "5rem"}} href="https://twitter.com/stevyhacker">
                    Author
                </Link>
            </Body>
        </div>
    );
}

export default App;
