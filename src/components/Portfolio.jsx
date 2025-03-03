import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function Favorites() {
  const [portfolio, setPortfolio] = useState([]);
  const previousPricesRef = useRef({}); // 🔥 Mantiene i prezzi precedenti

  const priceFormatter = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });

  const holdingFormatter = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // useEffect(() => {
  //   fetch("http://127.0.0.1:8000/api/portfolios")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setPortfolio(data.data);
  //       console.log("📌 Dati iniziali caricati:", data.data);

  //       const updatePrices = async () => {
  //         try {
  //           console.log("🔄 Aggiornamento prezzi in corso...");

  //           const updatedFavorites = await Promise.all(
  //             portfolio.map(async (singlePortfolioToken) => {
  //               const response = await fetch(
  //                 `https://api.coingecko.com/api/v3/coins/${singlePortfolioToken.api_id}`
  //               );
  //               const data = await response.json();

  //               const marketCapRank = data.market_data.market_cap_rank;
  //               const newPrice = data.market_data.current_price.usd;
  //               const newMarketCap = data.market_data.market_cap.usd;
  //               const oldPrice = previousPricesRef.current[singlePortfolioToken.api_id] || singlePortfolioToken.price;

  //               console.log(
  //                 `📊 ${singlePortfolioToken.name} - Vecchio prezzo: ${oldPrice}, Nuovo prezzo: ${newPrice}`
  //               );



  //               return { ...singlePortfolioToken, price: newPrice, market_cap: newMarketCap, market_cap_rank: marketCapRank  };
  //             })
  //           );

  //           setPortfolio(updatedFavorites);
  //         } catch (error) {
  //           console.error("Errore durante l'aggiornamento dei prezzi:", error);
  //         }
  //       };
  //       const interval = setInterval(updatePrices, 20000);
  //       return () => clearInterval(interval);
  //     })
  //     .catch((error) => console.error("Errore:", error));
  // }, []);

  // useEffect(() => {


  //   const interval = setInterval(updatePrices, 20000);
  //   return () => clearInterval(interval);
  // }, [portfolio]);

  // 🔥 Aggiorna previousPricesRef SOLO dopo che favorites è stato aggiornato
  // useEffect(() => {
  //   portfolio.forEach((singlePortfolioToken) => {
  //     previousPricesRef.current[singlePortfolioToken.api_id] = singlePortfolioToken.price;
  //   });
  //   console.log("✅ previousPricesRef aggiornato:", previousPricesRef.current);
  // }, [portfolio]); // 👈 Dipende solo da favorites, quindi si aggiorna DOPO il render

  const fetchPortfolioData = async () => {
    try {
      console.log("📌 Recupero dati dal backend...");
      const response = await fetch("http://127.0.0.1:8000/api/portfolios");
      const data = await response.json();

      if (!data.data) {
        console.error("❌ Errore: dati del portafoglio non validi");
        return;
      }

      const portfolioData = data.data;

      console.log("📌 Portafoglio ricevuto:", portfolioData);

      // 🔄 Recupera i dati di mercato da CoinGecko
      const updatedPortfolio = await Promise.all(
        portfolioData.map(async (token) => {
          try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${token.api_id}`);
            const marketData = await response.json();

            if (!marketData.market_data) {
              console.warn(`⚠️ Dati di mercato non disponibili per ${token.name}`);
              return token; // Ritorna il token originale se i dati sono assenti
            }

            const newPrice = marketData.market_data.current_price?.usd || token.price;
            const newMarketCap = marketData.market_data.market_cap?.usd || token.market_cap;
            const marketCapRank = marketData.market_data.market_cap_rank || token.market_cap_rank;
            const oldPrice = previousPricesRef.current[token.api_id] || token.price;

            console.log(`📊 ${token.name} - Vecchio prezzo: ${oldPrice}, Nuovo prezzo: ${newPrice}`);

            return {
              ...token,
              price: newPrice,
              market_cap: newMarketCap,
              market_cap_rank: marketCapRank,
            };
          } catch (error) {
            console.error(`❌ Errore nel recupero dati di mercato per ${token.name}:`, error);
            return token; // In caso di errore, ritorna il token senza aggiornamenti
          }
        })
      );

      setPortfolio(updatedPortfolio);

      // 🔥 Aggiorna i prezzi precedenti
      updatedPortfolio.forEach((token) => {
        previousPricesRef.current[token.api_id] = token.price;
      });

    } catch (error) {
      console.error("❌ Errore durante il recupero del portafoglio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolioData(); // 🔥 Chiamata iniziale

    // 🔄 Aggiorna i prezzi ogni 20 secondi
    const interval = setInterval(fetchPortfolioData, 20000);
    return () => clearInterval(interval); // Pulisce l'intervallo quando il componente si smonta
  }, []);



  return (
    <div className="watchlist-table flex flex-col items-center">
      <h2 className="table-title my-5">My Portfolio</h2>
      <div className="table-container">
        <table className="crypto-table border table-fixed rounded-xl">
          <thead>
            <tr className="row-table-head table-border-bottom">
              <th className="w-40">Rank</th>
              <th>Cryptocurrency</th>
              <th>Price</th>
              <th>Holdings</th>
              <th>PnL</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((singlePortfolioToken) => {
              return (
                <tr
                  key={singlePortfolioToken.id}
                  className="table-border-bottom text-center font-bold">
                  <td>{singlePortfolioToken.market_cap_rank}</td>
                  <td className="flex items-center crypto-name">
                    <img
                      src={singlePortfolioToken.image}
                      className="crypto-logo mr-5"
                      alt=""
                    />
                    <h3>{singlePortfolioToken.name}</h3>
                  </td>
                  <td>$ {priceFormatter.format(singlePortfolioToken.price)}</td>
                  <td className="flex flex-col">$ {holdingFormatter.format(singlePortfolioToken.number_of_token_owned * singlePortfolioToken.price)} <span>{parseFloat(singlePortfolioToken.number_of_token_owned).toFixed(2)} {singlePortfolioToken.symbol.toUpperCase()}</span></td>
                  <td>$ {holdingFormatter.format(singlePortfolioToken.tot_spent)}</td>
                  <td className="pe-5">
                    <button style={{ cursor: "pointer" }}>
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ color: "gold" }}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
