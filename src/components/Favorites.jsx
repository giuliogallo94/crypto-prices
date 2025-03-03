import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function FavoriteList() {
  const [favorites, setFavorites] = useState([]);
  const previousPricesRef = useRef({}); // 🔥 Mantiene i prezzi precedenti

  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });

  const formatNumberWithSuffix = (num) => {
    if (num >= 1_000_000_000_000) {
      return (num / 1_000_000_000_000).toFixed(2).replace(".", ",") + "T";
    } else if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2).replace(".", ",") + "B";
    } else if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2).replace(".", ",") + "M";
    }
    return num.toLocaleString("en-US", {  style: "currency",
      currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/favorites")
      .then((response) => response.json())
      .then((data) => {
        setFavorites(data.data);
        console.log("📌 Dati iniziali caricati:", data.data);
      })
      .catch((error) => console.error("Errore:", error));
  }, []);

  useEffect(() => {
    const updatePrices = async () => {
      try {
        console.log("🔄 Aggiornamento prezzi in corso...");

        const updatedFavorites = await Promise.all(
          favorites.map(async (fav) => {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${fav.api_id}`
            );
            const data = await response.json();

            const marketCapRank = data.market_data.market_cap_rank;
            const newPrice = data.market_data.current_price.usd;
            const newMarketCap = data.market_data.market_cap.usd;
            const oldPrice = previousPricesRef.current[fav.api_id] || fav.price;

            console.log(
              `📊 ${fav.name} - Vecchio prezzo: ${oldPrice}, Nuovo prezzo: ${newPrice}`
            );

            // 🔴 Se il prezzo è cambiato, aggiorniamo il database
            if (oldPrice !== newPrice) {
              console.log(
                `⚡ ${fav.name} - Prezzo cambiato! Aggiorno nel DB...`
              );
              await fetch(`http://127.0.0.1:8000/api/favorites/${fav.api_id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  market_cap_rank: marketCapRank,
                  price: newPrice,
                  market_cap: newMarketCap,
                }),
              });
            }

            return { ...fav, price: newPrice, market_cap: newMarketCap };
          })
        );

        setFavorites(updatedFavorites);
      } catch (error) {
        console.error("Errore durante l'aggiornamento dei prezzi:", error);
      }
    };

    const interval = setInterval(updatePrices, 20000);
    return () => clearInterval(interval);
  }, [favorites]);

  // 🔥 Aggiorna previousPricesRef SOLO dopo che favorites è stato aggiornato
  useEffect(() => {
    favorites.forEach((fav) => {
      previousPricesRef.current[fav.api_id] = fav.price;
    });
    console.log("✅ previousPricesRef aggiornato:", previousPricesRef.current);
  }, [favorites]); // 👈 Dipende solo da favorites, quindi si aggiorna DOPO il render

  const removeFromFavorites = async (crypto) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/favorites/${crypto.api_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Errore nella rimozione dai preferiti");
      }

      setFavorites((prevFavorites) =>
        prevFavorites.filter((coin) => coin.api_id !== crypto.api_id)
      );
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  return (
    <div className="watchlist-table flex flex-col items-center">
      <h2 className="table-title my-5">Watchlist</h2>
      <div className="table-container">
        <table className="crypto-table border table-fixed rounded-xl">
          <thead>
            <tr className="row-table-head table-border-bottom">
              <th className="w-40">Rank</th>
              <th>Cryptocurrency</th>
              <th>Price</th>
              <th>Market Cap</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((fav) => {
              const previousPrice =
                previousPricesRef.current[fav.api_id] || fav.price;
              console.log(
                `💡 ${fav.name} - Attuale: ${fav.price}, Precedente: ${previousPrice}`
              );

              return (
                <tr
                  key={fav.id}
                  className="table-border-bottom text-center font-bold h-12">
                  <td>{fav.market_cap_rank}</td>
                  <td className="flex items-center crypto-name">
                    <img src={fav.image} className="crypto-logo mr-5" alt="" />
                    <h3>{fav.name}</h3>
                  </td>
                  <td
                    className={
                      fav.price > previousPrice
                        ? "up-price"
                        : fav.price < previousPrice
                        ? "down-price"
                        : ""
                    }>
                    {priceFormatter.format(fav.price)}
                  </td>
                  <td>{formatNumberWithSuffix(fav.market_cap)}</td>
                  <td className="pe-5">
                    <button
                      onClick={() => removeFromFavorites(fav)}
                      style={{ cursor: "pointer" }}>
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ color: "gold" }}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}

          {[...Array(Math.max(0, 10 - favorites.length))].map((_, index) => (
              <tr key={`empty-${index}`} className="table-border-bottom text-center font-bold h-12">
                <td colSpan="5" className="h-10"></td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
