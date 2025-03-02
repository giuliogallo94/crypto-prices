import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function Favorites() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/portfolios")
      .then((response) => response.json())
      .then((data) => {
        setPortfolio(data.data);
        console.log("📌 Dati iniziali caricati:", data.data);
      })
      .catch((error) => console.error("Errore:", error));
  }, []);

  useEffect(() => {
    const fetchCryptoData = async () => {
      if (!portfolio || portfolio.length === 0) {
        setLoading(false); // Se il portfolio è vuoto, smetti di caricare
        return;
      }

      try {
        const updatedCoins = await Promise.all(
          portfolio.map(async (coin) => {
            try {
              const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coin.api_id}`
              );

              if (!response.ok) {
                console.warn(`Errore nel recupero dei dati per ${coin.symbol}`);
                return { ...coin, market_data: null };
              }

              const data = await response.json();

              return {
                ...coin,
                market_data: {
                  market_cap_rank: data.market_cap_rank ?? "N/A",
                  current_price: data.market_data?.current_price?.usd ?? 0,
                  market_cap: data.market_data?.market_cap?.usd ?? 0,
                },
              };
            } catch (err) {
              console.error(
                `Errore nel recupero dei dati per ${coin.symbol}:`,
                err
              );
              return { ...coin, market_data: null };
            }
          })
        );

        console.log("Dati aggiornati del portafoglio:", updatedCoins);
        setPortfolio(updatedCoins);
      } catch (error) {
        console.error("Errore generale nel recupero dei dati:", error);
      } finally {
        setLoading(false); // Imposta loading a false quando i dati sono pronti
      }
    };

    // Chiamata iniziale solo se il componente è montato
    if (!isMounted.current) {
      isMounted.current = true;
      fetchCryptoData();
    }

    // // Intervallo per aggiornare ogni 20 secondi
    // const interval = setInterval(() => {
    //   fetchCryptoData();
    // }, 20000);

    // return () => clearInterval(interval); // Pulizia dell'intervallo al cambio di componente
  }); // Nessuna dipendenza per evitare il loop infinito

  if (loading) {
    return <p>Caricamento dati in corso...</p>;
  }

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
              <th>Owned</th>
              <th>Bought For</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((singleToken) => {
              return (
                <tr
                  key={singleToken.id}
                  className="table-border-bottom text-center font-bold">
                  <td>rank</td>
                  <td className="flex items-center crypto-name">
                    <img
                      src={singleToken.image}
                      className="crypto-logo mr-5"
                      alt=""
                    />
                    <h3>{singleToken.name}</h3>
                  </td>
                  <td>{singleToken.market_data.current_price}</td>
                  <td>{singleToken.number_of_token_owned}</td>
                  <td>{formatter.format(singleToken.tot_spent)}</td>
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
