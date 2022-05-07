import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Plot from 'react-plotly.js';

//inaki
//https://www.npmjs.com/package/@unicef/material-ui-currency-textfield
import CurrencyTextField from '@unicef/material-ui-currency-textfield'

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;


export const ConnectButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 20px;
  font-size: 15px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 300px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const BuyButton = styled.button`
  padding: 10px;
  border-radius: 1px;
  border: none;
  background-color: var(--secondary);
  padding: 30px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 150px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
  &:disabled {
    opacity: 0.4
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
width: 100%;
@media (min-width: 767px) {
  flex-direction: row;
}
  transition: width 0.5s;
`;

export const StyledImg = styled.img`
  background-color: var(--accent);
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 400px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => { 
    let cost = nft_value*1e18;//CONFIG.WEI_COST; //FIXME inaki
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount); //FIXME inaki
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your NFT... Once the transaction is confirmed, you will be able to see your NFT here.`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, String(cost)) //FIXME inaki
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later or refresh the page.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Congratulation this NFT is yours! It will be displayed shortly. Please wait for IPFS access...`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
        showNFT();
      });
  };

  //inaki
  //const nft = await blockchain.smartContract.methods.walletOfOwner(blockchain.account).call()


  const showNFT = () => {
    //const nft = blockchain.smartContract.methods.tokenURI("1").call().value
    //console.log(nft) 
    blockchain.smartContract.methods.walletOfOwner(blockchain.account).call(function (err, res) {

      if (err) {
    
        console.log("An error occured", err)
    
        return
    
      }
      console.log("The token is: ", res[res.length-1])
    
      blockchain.smartContract.methods.tokenURI(res[res.length-1]).call(function (errr, ress) {

        if (errr) {
      
          console.log("An error occured", errr)
      
          return
      
        }
      
        console.log("The balance is: ", ress.replace('ipfs://',''))

        fetch('https://ipfs.io/ipfs/'.concat('',ress.replace('ipfs://','')))
            .then(result => result.json())
            .then((output) => {
                console.log('Output: ', output);
                console.log('Output: ',  'https://ipfs.io/ipfs/'.concat('',output["image"].replace('ipfs://','')) );
                let imageUrlFetched = 'https://ipfs.io/ipfs/'.concat('',output["image"].replace('ipfs://',''))
                setFeedback(
                <s.Container  flex={1}  ai={"center"} >
                  <s.SpacerSmall />
                <s.Container 
                flex={3}  
                ai={"center"}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  paddingRight:100,
                  paddingLeft:100,
                }}
                >

                  <StyledImg alt={"IPFS access failed... please go on Etherscan or OpenSea to view your NFT"}  src={imageUrlFetched} />
                  <s.TextDate> {`Name of your NFT : ${output["name"]}`} </s.TextDate> 
                  <s.TextDate> {`ID of your NFT : ${output["id"]}`} </s.TextDate> 
                  <s.TextDate> {output["description"]} </s.TextDate> 
                  </s.Container>
                </s.Container>
                );
        }).catch(err => console.error(err));

      })
    
    })
  }
    

  //end inaki


  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  //inaki
  let price_nft_minted = data.costPerMint;
  //let price_nft_minted = [0.005,0.005,0.05,0.5,0.7,0,0,0];//FIXME

  price_nft_minted = price_nft_minted.filter(function(value, index, arr){ 
      return value > 0;
  });

  price_nft_minted = price_nft_minted.map(function(item) { return item/1e18 });

  const minAmount = price_nft_minted[price_nft_minted.length-1];

  const [valueDefinedByBuyer, setValue] = React.useState(0);
  const isTooLow = valueDefinedByBuyer <= minAmount;
  const warningPrice = `Price must be above  the last NFT (${minAmount} ETH)`;

  //var for plot
  const nft_ids = [...Array(price_nft_minted.length).keys()].map(i => i + 1);//{ values: [50] };
  const price_array = [...price_nft_minted];
  nft_ids.push(price_nft_minted.length+1);
  price_array.push(2);//{ values: [50] };

  let nft_value = valueDefinedByBuyer;
  if (!valueDefinedByBuyer){
    nft_value=0;
  }

  let plotColor = '#c43e00'
  
  price_array[price_array.length-1]=nft_value;
  if(price_array[price_array.length-1]<price_array[price_array.length-2]){
    price_array[price_array.length-1]=price_array[price_array.length-2]
  }

  const buyEnable_b = claimingNft || isTooLow;

  let figTitle = `Evolution of the prices for the NFTs already minted (and your future NFT)`;
  let mintingTitle = `Ready to mint n° ${parseInt(data.totalSupply)+1} out of ${CONFIG.MAX_SUPPLY}`;
  if (price_array.length >= CONFIG.MAX_SUPPLY){
    price_array.pop();
    figTitle = `Evolution of the prices of "the Nash suns" collection on the primary market`
    mintingTitle = `All ${CONFIG.MAX_SUPPLY} NFTs were minted!`

  }

  //plot for twitter (need to remove)
  const twitter = true;
  if(twitter){
    price_array.pop();
    figTitle = `Evolution of the prices for the NFTs already minted`;
  }


  const B = (props) => <s.TextDescription style={{fontWeight: 'bold'}}>{props.children}</s.TextDescription>

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1}  ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/1.png"} />
            <s.TextDate > #1 </s.TextDate> 
            <StyledImg alt={"example"} src={"/config/images/45.png"} />
            <s.TextDate> #45 </s.TextDate> 
            <StyledImg alt={"example"} src={"/config/images/87.png"} />
            <s.TextDate> #87 </s.TextDate> 
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 10,
              borderRadius: 0,
            }}
          >
            <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
            <s.SpacerSmall />
            <s.TextDescription
              style={{ textAlign: "justify", color: "var(--accent-text)" }}
            >
              
              This collection consists of 250 unique Nash suns. 
              Each NFT is manually signed by the artist.
              By owning an NFT, you become the official owner of a Nash sun.
              <br/><br/>
              The collector decides on the price at which he values the mint.
              However, there are two rules : 
              <br/>- the 1st minted NFT costs a minimum of 0.005 ETH. 
              <br/>- for each following mint, the collector must choose a higher price than the previously minted NFT (the increase may be small or large). 
              <br/>Thus, the value of the collection will be defined by collectors’ strategies. 
              
              <br/><br/>
              The collection is called "the Nash suns" in tribute to John Nash and his contributions to game theory. 
              The collector will face the Collector's Dilemma. He will have different choices :
              <br/>- increase the price slightly and hope that the floor price will be raised sharply by others
              <br/>- or raise the price heavily to directly impact future sales. But will other collectors want to follow? 
              
            </s.TextDescription>
            <s.SpacerMedium />
            <s.TextDescription
              style={{ textAlign: "center", color: "var(--accent-text)" }}
            >
              How far do you want this collection to go ? You act.
            </s.TextDescription>
            
            
            {blockchain.account === "" ||
            blockchain.smartContract === null ? (
              <s.Container ai={"center"} jc={"center"}>
                <s.SpacerSmall />
                <ConnectButton
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(connect());
                    getData();
                  }}
                >
                  CONNECT TO METAMASK <br/> with the {CONFIG.NETWORK.NAME} network
                </ConnectButton>
                {blockchain.errorMsg !== "" ? (
                  <>
                    <s.SpacerSmall />
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {blockchain.errorMsg}
                    </s.TextDescription>
                  </>
                ) : null}
              </s.Container>
            ) : (
              <>  
                




                <s.Container 
                style={{
                  backgroundColor: "var(--accent)",
                  padding: 10,
                  borderRadius: 1,
                  border: "4px solid var(--secondary)",
                }}
                >
                <s.Container ai={"center"} jc={"center"} fd={"row"}>
                <s.TextTitle
                  style={{
                    textAlign: "center",
                    fontSize: 35,
                    fontWeight: "bold",
                    color: "var(--accent-text)",
                  }}
                >
                 {mintingTitle}
                </s.TextTitle>
                </s.Container>

                {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                  <>
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <s.TextDescription
                        style={{ textAlign: "center", color: "var(--accent-text)" }}
                      >
                        The mint has ended.
                        You can still find {CONFIG.NFT_NAME} on <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>{CONFIG.MARKETPLACE}</StyledLink>
                      </s.TextDescription>
                    </s.Container>
                  </>
                ) : (
                  <>


                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <s.TextTitle
                      style={{ textAlign: "center", color: "var(--secondary)", fontWeight: "bold" }}
                    >
                    Fill in the price you wish to mint

                    </s.TextTitle>
                    </s.Container>
                      <s.SpacerSmall />

                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <CurrencyTextField
                      label="Price"
                      variant="standard"
                      value={valueDefinedByBuyer}
                      currencySymbol="ETH"
                      minimumValue="0"
                      outputFormat="string"
                      decimalCharacter="."
                      digitGroupSeparator=","
                      onChange={(event, valueDefinedByBuyer)=> setValue(valueDefinedByBuyer)}
                      error={isTooLow}
                      helperText={warningPrice}
                      decimalPlaces="4"
                      />
                      <s.SpacerMedium />
                      <BuyButton
                        disabled={buyEnable_b ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          //showNFT();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </BuyButton>
                    </s.Container>

                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    </s.Container>
                  </>
                )}


                <s.SpacerMedium />
                <s.Container ai={"center"} jc={"center"} fd={"row"}> 
                <s.TextDescription
                  style={{
                    textAlign: "center",
                    color: "var(--accent-text)",
                  }}
                >
                  By minting you will impact the Collectors' Curve forever.
                </s.TextDescription> 
                </s.Container>

                <s.Container ai={"center"} jc={"center"} fd={"row"}>
                <Plot
                data={[
                  {
                    x: nft_ids,
                    y: price_array,
                    fill: 'tozeroy',
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: plotColor},
                  },
                ]}
                layout={ 
                  {
                    xaxis:{title:'NFT IDs',tickvals:nft_ids,showgrid: false},
                    yaxis:{title:'Price (ETH)'} }
                  }
                  useResizeHandler={true}
                  style={
                    {
                      width: '100%',
                      height: '100%'
                    }
                  }
                  config={
                    {
                      displayModeBar:false,
                      staticPlot:true
                    }
                  }
                />
                </s.Container>
                <s.Container ai={"center"} jc={"center"} fd={"row"}>
                <s.TextDescription
                  style={{
                    textAlign: "center",
                    textDecorationLine: 'underline',
                    color: "var(--accent-text)",
                  }}
                >
                  The Collectors' Curve : {figTitle}
                </s.TextDescription> 
                </s.Container>
                </s.Container>




                <s.SpacerSmall />
              </>
            )}
            <s.SpacerMedium />
            <s.SpacerMedium />
            <s.TextDescription
              style={{ textAlign: "justify", color: "var(--accent-text)", fontSize:"14px" }}
            >
              I'm <StyledLink target={"_blank"} href="https://twitter.com/YEUYEUH"> Yeuyeuh</StyledLink>, a data scientist who turns into a web3 impressionist. 
              This collection is my first web3 project, and I will be here for a while to create other underground projects.
            Collectors can share their suns and discuss their purchasing strategies on  
            <StyledLink target={"_blank"} href="https://discord.gg/h56KcSwN"> Discord</StyledLink>.
            The smart contract can be read on 
            <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}> Etherscan</StyledLink>.
            
            NFTs already minted can be seen on <StyledLink target={"_blank"} href="https://opensea.io/collection/thenashsun"> OpenSea</StyledLink>.
            For the secondary market, the owner will determine his own sale price.
            
            One last thing : Remember not to fly too close to the sun.
              
            </s.TextDescription>
          </s.Container>
          <s.SpacerLarge />
          
          <s.Container flex={1} ai={"center"}>
            
            <StyledImg alt={"example"} src={"/config/images/123.png"} />
            <s.TextDate> #123 </s.TextDate> 
            <StyledImg alt={"example"} src={"/config/images/158.png"} />
            <s.TextDate> #158 </s.TextDate> 
            <StyledImg alt={"example"} src={"/config/images/173.png"} />
            <s.TextDate> #173 </s.TextDate> 
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />

      </s.Container>
    </s.Screen>
  );
}

export default App;
