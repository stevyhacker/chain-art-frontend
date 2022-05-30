import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLink} from "@fortawesome/free-solid-svg-icons";
import {Link} from "./index";
import React from "react";

function Footer() {
    return <>
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
    </>;
}

export default Footer;