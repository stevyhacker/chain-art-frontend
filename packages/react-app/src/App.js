import {useQuery} from "@apollo/react-hooks";
import {Contract} from "@ethersproject/contracts";
import {getDefaultProvider} from "@ethersproject/providers";
import React, {useEffect, useState} from "react";
import ImageUploading from "react-images-uploading";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGlobe, faImage} from '@fortawesome/free-solid-svg-icons'
import {Body, Button, Header, Image, Link} from "./components";
import logo from "./ethereumLogo.png";
import useWeb3Modal from "./hooks/useWeb3Modal";

import {addresses, abis} from "@project/contracts";

// import GET_TRANSFERS from "./graphql/subgraph";

async function uploadArt() {
    // Should replace with the end-user wallet, e.g. Metamask
    // const defaultProvider = getDefaultProvider();
    // Create an instance of an ethers.js Contract
    // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
    // const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
    // A pre-defined address that owns some CEAERC20 tokens
    // const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
    // console.log({ tokenBalance: tokenBalance.toString() });
}

function WalletButton({provider, loadWeb3Modal, logoutOfWeb3Modal}) {
    const [account, setAccount] = useState("");
    const [rendered, setRendered] = useState("");

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
                const name = await provider.lookupAddress(accounts[0]);

                // Render either the ENS name or the shortened account address.
                if (name) {
                    setRendered(name);
                } else {
                    setRendered(account.substring(0, 6) + "..." + account.substring(36));
                }
            } catch (err) {
                setAccount("");
                setRendered("");
                console.error(err);
            }
        }

        fetchAccount();
    }, [account, provider, setAccount, setRendered]);

    return (
        <Button
            onClick={() => {
                if (!provider) {
                    loadWeb3Modal();
                } else {
                    logoutOfWeb3Modal();
                }
            }}>
            {rendered === "" && "Connect Wallet"}
            {rendered !== "" && rendered}
        </Button>
    );
}

function App() {
    // const { loading, error, data } = useQuery(GET_TRANSFERS);
    const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

    // React.useEffect(() => {
    //   if (!loading && !error && data && data.transfers) {
    //     console.log({ transfers: data.transfers });
    //   }
    // }, [loading, error, data]);


    const [images, setImages] = React.useState([]);
    const maxNumber = 1;
    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        // console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

    return (
        <div>
            <Header>
                <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal}/>
            </Header>
            <Body>
                <h2>On-chain Art NFT Minter (⛓,🖼)</h2>

                {/*<Image src={logo} alt="react-logo" />*/}
                <p className={"description"}>
                    Upload your image here and confirm the transaction.
                    <br/>
                    The image will be saved on-chain in SVG format and an NFT will be minted for you.
                    <br/>
                    <br/>
                    Larger image files will be split into multiple transactions. <br/>
                    For the best quality, upload images in SVG format.
                    <br/>
                    Other formats will take more space and require more gas == more expensive transactions.
                </p>

                {/*<Link href="https://ethereum.org/developers/#getting-started" style={{ marginTop: "8px" }}>*/}
                {/*  Learn Ethereum*/}
                {/*</Link>*/}

                <ImageUploading
                    value={images}
                    onChange={onChange}
                    dataURLKey="data_url">
                    {({
                          imageList,
                          onImageUpload,
                          onImageRemoveAll,
                          onImageUpdate,
                          onImageRemove,
                          isDragging,
                          dragProps
                      }) => (
                        // write your building UI
                        <div className="upload__image-wrapper">
                            <Button
                                style={isDragging ? {color: "#2c3e9a"} : null}
                                onClick={onImageUpload}
                                {...dragProps} >
                                <FontAwesomeIcon icon={faImage} size={"lg"}/> <br/>
                                <br/>
                                {isDragging ? "Drop Image here" : "Pick or Drag an Image here"}
                            </Button>
                            <br/>
                            <br/>
                            {/*<Button onClick={onImageRemoveAll}>Remove image</Button>*/}
                            {imageList.map((image, index) => (
                                <div key={index} className="image-item">
                                    <img src={image.data_url} alt="" width="150"/>
                                    <div className="image-item__btn-wrapper">
                                        {/*<Button onClick={() => onImageUpdate(index)}>Replace</Button>*/}
                                        {/*<Button onClick={() => onImageRemove(index)}>Remove</Button>*/}
                                        <Button className="fas fa-image" onClick={() => uploadArt()}>
                                            <FontAwesomeIcon icon={faGlobe} size={"lg"}/> <br/><br/>
                                            Upload Art
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ImageUploading>


            </Body>
        </div>
    );
}

export default App;
