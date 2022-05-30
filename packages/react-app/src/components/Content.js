function Content() {
    return <>
        <h2>On-chain Art NFT Minter (⛓,🖼)</h2>

        <p className={"description"} style={{marginBottom: "50px"}}>
            Why on-chain minting?
            <br/>
            Because NFTs today store data on servers or IPFS which are in no way related to the
            blockchain which hosts NFTs.
            <br/>
            Here the images will be saved on-chain in base64 encoding and an NFT will be minted for
            you.
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
    </>;
}

export default Content;