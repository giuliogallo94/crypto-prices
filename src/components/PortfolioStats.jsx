import { useEffect, useState } from "react";
export default  function PortfolioStats({portfolio}) {
    const [highestPnLCrypto, setHighestPnLCrypto] = useState(null);

    useEffect(() => {
        if (portfolio.length > 0) {
            const updatedHighestPnLCrypto = portfolio.reduce((max, token) => {
                const tokenPnL = token.price * token.number_of_token_owned - token.tot_spent;
                return tokenPnL > (max.PnL || 0) ? { ...token, PnL: tokenPnL } : max;
            }, { PnL: -Infinity }); // Inizializza con un valore molto basso

            setHighestPnLCrypto(updatedHighestPnLCrypto);
        }
    }, [portfolio]);
    const totalSpent = portfolio.reduce((acc, token) => acc + parseFloat(token.tot_spent || 0), 0);
    const yesterdatTotalValue = portfolio?.reduce((acc, token) => acc + parseFloat(token.yesterdayPrice) * parseFloat(token.number_of_token_owned), 0);
    const totalValue = portfolio.reduce((acc, token) => acc + parseFloat(token.price) * parseFloat(token.number_of_token_owned), 0);
    const totalPnL = totalValue - totalSpent;
    const totalPnLPercentage = totalSpent > 0 ? (totalPnL / totalSpent) * 100 : 0;
    const changeFromYesterday = yesterdatTotalValue - totalValue;
    const percentageChange = yesterdatTotalValue !== 0 
                        ? ((totalValue - yesterdatTotalValue) / -yesterdatTotalValue) * 100 
                        : 0;
    // const highestPnLCrypto = portfolio?.reduce((max, token) => token.PnL > max.PnL ? token : max, portfolio[0]);
    console.log("Cripto con PnL più alto:", highestPnLCrypto);
    const pnl = highestPnLCrypto?.price * highestPnLCrypto?.number_of_token_owned - highestPnLCrypto?.tot_spent;
    const priceFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      });

    return ( 
        
            <div className="grid grid-cols-4 mb-5 mx-5 gap-4 text-center">

                <div className="portfolio-stats">
                    <h4>{priceFormatter.format(totalValue)}</h4>
                    <span>Total Value</span>
                </div> 
                <div className="portfolio-stats">
                    <h4>{priceFormatter.format(totalPnL)} ({(totalPnLPercentage).toFixed(2)}%)</h4>
                    <span>PnL</span>

                </div>
                <div className="portfolio-stats">
                    <h4>{priceFormatter.format(changeFromYesterday)}</h4>
                    <span>24H Change ({percentageChange.toFixed(2)}%)</span>
                </div>
                <div className="portfolio-stats">
                    <div className="flex justify-center">

                <img
                    src={highestPnLCrypto?.image}
                    className="crypto-logo mr-1"
                    alt=""
                    />
                    <h4>{highestPnLCrypto?.name}</h4> 
                    </div>
                    <span>Top Gainer ({priceFormatter.format(pnl)})</span>
                </div>

            </div>
    )
    }