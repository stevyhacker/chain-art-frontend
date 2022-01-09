import {Contract} from "@ethersproject/contracts";
import React, {useEffect, useState} from "react";
import ImageUploading from "react-images-uploading";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGlobe, faImage, faLink} from '@fortawesome/free-solid-svg-icons'
import {Body, Button, Header, Image, Link, SmallLink} from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";

import {addresses, abis} from "@project/contracts";


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
                // const networkName = await provider.getNetwork().getChainId();

                // Render either the ENS name or the shortened account address.
                try {
                    const name = await provider.lookupAddress(accounts[0]);
                    setRendered(name);
                } catch (e) {
                    setRendered(account.substring(0, 6) + "..." + account.substring(36));
                }
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
            {chain !== undefined && chain !== " : matic" ?
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
    // const { loading, error, data } = useQuery(GET_TRANSFERS);
    const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

    // React.useEffect(() => {
    //   if (!loading && !error && data && data.transfers) {
    //     console.log({ transfers: data.transfers });
    //   }
    // }, [loading, error, data]);

    const [images, setImages] = React.useState([]);
    const onChange = (imageList) => {
        setImages(imageList);
    };

    function uploadArt(provider, dataUrl) {

        if (provider !== undefined) {
            const signer = provider.getSigner();
            // Create an instance of an ethers.js Contract
            // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
            const chainArtContract = new Contract(addresses.chainArt, abis.chainArt, provider);
            chainArtContract.connect(signer);
            signer.getAddress().then(r => console.log(r));
            console.log("provider is ok");
            console.log(dataUrl);
        } else {
            console.log("provider is not defined");
            loadWeb3Modal().then(
                //todo continue flow
            );
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

                    <h2>On-chain Art NFT Minter (⛓,🖼)</h2>

                    {/*<Image src={logo} alt="react-logo" />*/}
                    <p className={"description"}>
                        Upload your image here and confirm the transaction.
                        <br/>
                        The image will be saved on-chain in base64 encoding and an NFT will be minted for you.
                        <br/>
                        <br/>
                        Larger image files will be split into multiple transactions. <br/>
                        For the best quality, upload images in SVG format.
                        <br/>
                        Other formats will take more space and require more gas == more expensive transactions.
                    </p>

                    <ImageUploading
                        value={images}
                        onChange={onChange}
                        dataURLKey="data_url">
                        {({
                              imageList,
                              onImageUpload,
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
                                {imageList.map((image, index) => (
                                    <div key={index} className="image-item">
                                        <img src={image.data_url} alt="" width="150"/>
                                        <div className="image-item__btn-wrapper">
                                            <Button className="fas fa-image"
                                                    onClick={() => uploadArt(provider, image.data_url)}>
                                                <FontAwesomeIcon icon={faGlobe} size={"lg"}/> <br/><br/>
                                                Upload Art
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ImageUploading>
                </div>

                <p style={{marginTop: "200px"}}><FontAwesomeIcon icon={faLink}/> Links:</p>

                <Link href="https://twitter.com/stevyhacker" style={{marginTop: "8px"}}>
                    Code
                </Link>
                <Link href="https://twitter.com/stevyhacker" style={{marginTop: "16px"}}>
                    Author
                </Link>
            </Body>
        </div>
    );
}

export default App;
