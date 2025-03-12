import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import PortfolioStats from "./PortfolioStats";

export default function Favorites() {
  const [portfolio, setPortfolio] = useState([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const previousPricesRef = useRef({}); // 🔥 Mantiene i prezzi precedenti

  const { register, setValue, watch, handleSubmit, reset } = useForm();
    const transactionQuantity = watch("transactionQuantity", 0); 
    const transactionPrice = watch("transactionPrice", 0);
    const transactionType = watch("transactionType", "1");
  
  useEffect(() => {
    setValue("transactionTotal", transactionQuantity * transactionPrice);
  }, [transactionQuantity, transactionPrice, setValue]);

  const toggleTransactionModal = (coin) => {
    setIsInfoOpen(false);
    setIsTransactionOpen(!isTransactionOpen);

    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16);
    setValue("transactionDate", formattedDateTime);

  };

  const toggleInfoModal = (event, coin) => {
    setIsInfoOpen(!isInfoOpen);
    setSelectedCoin(coin);
    const rect = event.currentTarget.getBoundingClientRect(); // Ottieni la posizione del bottone
    setModalPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    }); // Imposta la posizione
    console.log(coin);
  };

  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });

  const holdingFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const fetchPortfolioData = async () => {
    const token = localStorage.getItem('token');
    try {
      console.log("📌 Recupero dati dal backend...");
      const response = await fetch("http://127.0.0.1:8000/api/portfolios", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Passa il token come intestazione
        },
      });
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
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${token.api_id}`
            );
            const marketData = await response.json();

            if (!marketData.market_data) {
              console.warn(
                `⚠️ Dati di mercato non disponibili per ${token.name}`
              );
              return token; // Ritorna il token originale se i dati sono assenti
            }

            const newPrice =
              marketData.market_data.current_price?.usd || token.price;
            const newMarketCap =
              marketData.market_data.market_cap?.usd || token.market_cap;
            const marketCapRank =
              marketData.market_data.market_cap_rank || token.market_cap_rank;
            const oldPrice =
              previousPricesRef.current[token.api_id] || token.price;
            const priceChangeDay = marketData.market_data.price_change_24h;
            const actualPrice = marketData.market_data.current_price.usd;
            const yesterdayPrice = actualPrice - priceChangeDay;

            console.log(
              `📊 ${token.name} - Vecchio prezzo: ${oldPrice}, Nuovo prezzo: ${newPrice}`
            );

            return {
              ...token,
              price: newPrice,
              market_cap: newMarketCap,
              market_cap_rank: marketCapRank,
              yesterdayPrice: yesterdayPrice,
            };
          } catch (error) {
            console.error(
              `❌ Errore nel recupero dati di mercato per ${token.name}:`,
              error
            );
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

  const deleteFromPortfolio = async (crypto) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/portfolios/${crypto.api_id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          data.message || "Errore durante il cancellamento della crypto"
        );
      }

      setPortfolio((prevPortfolio) =>
        prevPortfolio.filter((token) => token.id !== crypto.id)
      );

      setIsInfoOpen(false);
    } catch (error) {
      console.error("Errore:", error.message);
    }
  };

  const updatePortfolio = async (crypto, formData) => {
    console.log(crypto, formData);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/portfolios/${crypto.api_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,

          },
          body: JSON.stringify({
            api_id: crypto.api_id,
            symbol: crypto.symbol,
            name: crypto.name,
            image: crypto.image,
            tot_spent: formData.transactionTotal,
            type_of_transaction: formData.transactionType,
            number_of_token: formData.transactionQuantity,
            transaction_price: formData.transactionPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Errore durante l'inserimento della transazione"
        );
      }

      console.log("Transazione aggiunta con successo:", data);

      fetchPortfolioData();

      reset()

      // Chiude il modal dopo il successo
      setIsTransactionOpen(false);
    } catch (error) {
      console.error("Errore:", error.message);
    }
  };

  useEffect(() => {
    fetchPortfolioData(); // 🔥 Chiamata iniziale

    // 🔄 Aggiorna i prezzi ogni 20 secondi
    const interval = setInterval(fetchPortfolioData, 20000);
    return () => clearInterval(interval); // Pulisce l'intervallo quando il componente si smonta
  }, []);

  return (
    <div id="portfolio-container" className=" flex flex-col">
      

      {
        portfolio.length > 0 ? (
        <>
          <h2 className="table-title py-5 text-center">My Portfolio</h2>
          <PortfolioStats portfolio={portfolio} />
          <div className="portfolio-container">
            <table className="crypto-table border table-fixed rounded-xl">
              <thead>
                <tr className="row-table-head table-border-bottom">
                  <th className="w-40">Rank</th>
                  <th>Cryptocurrency</th>
                  <th>Price</th>
                  <th>Holdings</th>
                  <th>Avg Buy Price</th>
                  <th>PnL</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((singlePortfolioToken) => {
                  const pnl =
                    singlePortfolioToken.price *
                      singlePortfolioToken.number_of_token_owned -
                    singlePortfolioToken.tot_spent;
                  return (
                    <tr
                      key={singlePortfolioToken.id}
                      className="table-border-bottom text-center font-bold h-12">
                      <td>{singlePortfolioToken.market_cap_rank}</td>
                      <td className="flex items-center crypto-name">
                        <img
                          src={singlePortfolioToken.image}
                          className="crypto-logo mr-5"
                          alt=""
                        />
                        <h3>{singlePortfolioToken.name}</h3>
                      </td>
                      <td>{priceFormatter.format(singlePortfolioToken.price)}</td>
                      <td>
                        {holdingFormatter.format(
                          singlePortfolioToken.number_of_token_owned *
                            singlePortfolioToken.price
                        )}{" "}
                        <br />{" "}
                        <span>
                          {parseFloat(
                            singlePortfolioToken.number_of_token_owned
                          ).toFixed(2)}{" "}
                          {singlePortfolioToken.symbol.toUpperCase()}
                        </span>
                      </td>
                      <td>{priceFormatter.format(singlePortfolioToken.avg_buy_price)}</td>
                      <td
                        className={
                          pnl < 0 ? "down-price" : pnl > 0 ? "up-price" : ""
                        }>
                        {" "}
                        {(pnl > 0 ? "+" : "") + holdingFormatter.format(pnl)}
                      </td>
                      <td className="pe-5">
                        <button
                          className="pointer"
                          onClick={(e) => toggleInfoModal(e, singlePortfolioToken)}>
                          :
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {[...Array(Math.max(0, 10 - portfolio.length))].map((_, index) => (
                  <tr
                    key={`empty-${index}`}
                    className="table-border-bottom text-center font-bold h-12">
                    <td colSpan="7" className="h-10"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isInfoOpen && (
              <div
                id="modal-portfolio-token"
                style={{
                  top: `${modalPosition.top}px`,
                  left: `${modalPosition.left}px`,
                }}>
                <ul id="transaction-modal">
                  <li
                    className="mb-2"
                    onClick={() => toggleTransactionModal(selectedCoin)}>
                    Add Transaction
                  </li>
                  <li onClick={() => deleteFromPortfolio(selectedCoin)}>Delete</li>
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (<h2 className="table-title py-5 text-center">Your Portfolio is empty</h2>)}

      {isTransactionOpen && (
        <div
          id="transaction-modal"
          className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <div className="flex justify-between mb-4 items-center grid-cols-3">
              <h2 className="text-xl font-bold">Transaction</h2>
              <button
                type="button"
                className="pointer"
                onClick={() => {toggleTransactionModal(); reset()}}>
                x
              </button>
            </div>

            {/* Form per inserire i dati */}
            <form onSubmit={handleSubmit((data) => updatePortfolio(selectedCoin, data))}>
              <div className="mb-3">
                <label className="block text-sm font-medium">Asset</label>
                <input
                  type="text"
                  className="mt-1 p-2 ps-8 w-full border rounded-md"
                  value={selectedCoin.name}
                  readOnly
                  style={{
                    backgroundImage: `url(${selectedCoin.image})`,
                    backgroundSize: "24px 24px",
                    backgroundPosition: "10px center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction
                </label>
                <select
                 {...register ("transactionType", {required: "The field is required"})}
                  className="mt-1 p-2 w-full border rounded-md">
                  <option value="1">Buy</option>
                  <option value="2">Sell</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {transactionType === "1" && "Buy Price"}
                  {transactionType === "2" && "Sell Price"}
                </label>
                <input
                  {...register ("transactionPrice", {required: "The field is required"})}
                  type="number"
                  step="any" 
                  className="mt-1 p-2 w-full border rounded-md"
                />
                <p
                  id="current-price"
                  onClick={() => setValue("transactionPrice", selectedCoin.current_price)}
                  className="pointer">
                  Market Price
                </p>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  {...register ("transactionQuantity", {required: "The field is required"})}
                  type="number"
                  step="any" 
                  className="mt-1 p-2 w-full border rounded-md"
                />
                <p
                  id="current-price"
                  onClick={() =>
                    setValue("transactionQuantity", selectedCoin.number_of_token_owned)
                  }
                  className="pointer">
                  Max Amount(
                  {parseFloat(selectedCoin.number_of_token_owned).toFixed(2)})
                </p>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Total
                </label>
                <input
                  {...register ("transactionTotal", {required: "The field is required"})}
                  type="number"
                  step="any" 
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Date and Time
                </label>
                <input
                  {...register ("transactionDate", {required: "The field is required"}, )}
                  type="datetime-local"
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Note
                </label>
                <input
                  type="text"
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  style={{ backgroundColor: "#16c784" }}
                  className="pointer px-4 py-2 text-white rounded-md">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* /Modal */}
    </div>
  );
}
