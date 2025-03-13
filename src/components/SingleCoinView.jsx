import { useLocation } from "react-router-dom";

export default function SingleCoinView() {
    const location = useLocation();
    const crypto = location.state?.crypto;

    const formatterPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      });


      const formatterSupply = new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: 0,  // Nessuna cifra decimale
        maximumFractionDigits: 0,  // Nessuna cifra decimale
    });

    console.log(crypto)

    return (
        <div id="single-crypto-container">
            <div className="single-crypto-header flex justify-center items-center p-5 gap-3">
                <span># {crypto.market_cap_rank}</span>
                <img id="single-crypto-image" src={crypto.image} alt="" />
                <h1>{crypto.name}</h1>
                <h3>{formatterPrice.format(crypto.current_price)}</h3>
            </div>

            <div className="grid grid-cols-4 mb-5 mx-5 gap-4 text-center">

            <div className="single-crypto-stats">
                <h4>{formatterPrice.format(crypto.market_cap)}</h4>
                <span>Market Cap</span>
            </div> 
            <div className="single-crypto-stats">
                <h4>{formatterSupply.format(crypto.circulating_supply)}</h4>
                <span>Circulating Supply</span>
            </div>
            <div className="single-crypto-stats">
                <h4>{formatterPrice.format(crypto.ath)}</h4>
                <span>All Time High</span>
            </div>
       
            <div className="single-crypto-stats">
                {crypto.max_supply !== null ? <h4>{formatterSupply.format(crypto.max_supply)}</h4> : <h4 className="text-xl">{"\u221E"}</h4>}
                <span>Max Supply</span>
            </div>

            </div>
        </div>
    )
}