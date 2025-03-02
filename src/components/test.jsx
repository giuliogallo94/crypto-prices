import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export default function FavoriteList() {
  const [favorites, setFavorites] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/favorites")
      .then((response) => response.json())
      .then((data) => {
        setFavorites(data.data);

        // Inizializza prezzi precedenti
        const initialPrices = {};
        data.data.forEach((fav) => {
          initialPrices[fav.api_id] = fav.price;
        });
        setPreviousPrices(initialPrices);
      })
      .catch((error) => console.error("Errore:", error));
  }, []);

  useEffect(() => {
    const updatePrices = async () => {
      try {
        const newPrices = {};
        const updatedFavorites = await Promise.all(
          favorites.map(async (fav) => {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${fav.api_id}`
            );
            const data = await response.json();

            const newPrice = data.market_data.current_price.usd;
            const newMarketCap = data.market_data.market_cap.usd;
            const oldPrice = previousPrices[fav.api_id] || fav.price;

            newPrices[fav.api_id] = newPrice;

            if (newPrice != oldPrice) {
              // **Aggiorna database**
              await fetch(`http://127.0.0.1:8000/api/favorites/${fav.api_id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  price: newPrice,
                  market_cap: newMarketCap,
                }),
              });
            }

            return { ...fav, price: newPrice, market_cap: newMarketCap };
          })
        );

        setPreviousPrices((prev) => ({
          ...prev,
          ...newPrices,
        }));

        setFavorites(updatedFavorites);
      } catch (error) {
        console.error("Errore durante l'aggiornamento dei prezzi:", error);
      }
    };

    const interval = setInterval(updatePrices, 30000); // Aggiorna ogni 20 secondi
    return () => clearInterval(interval);
  }, [favorites, previousPrices]);

  const removeFromFavorites = async (crypto) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/favorites/${crypto.name}`,
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
        prevFavorites.filter((coin) => coin.name !== crypto.name)
      );
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  return (
    <div className="main-table flex flex-col items-center">
      <h2 className="table-title my-5">Watchlist</h2>
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
          {/* {favorites.map((fav) => {
            const previousPrice = previousPrices[fav.api_id] || fav.price;

            return (
              <tr
                key={fav.id}
                className="table-border-bottom text-center font-bold">
                <td>{fav.market_cap_rank}</td>
                <td>{fav.name}</td>
                <td
                  style={
                    fav.price < previousPrices[fav.api_id]
                      ? { color: "green" }
                      : fav.price < previousPrice
                      ? { colore: "red" }
                      : { color: "white" }
                  }>
                  {formatter.format(fav.price)}
                </td>
                <td>{formatter.format(fav.market_cap)}</td>

                <td className="pe-5">
                  <button
                    onClick={() => removeFromFavorites(fav)}
                    style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={faStar} style={{ color: "gold" }} />
                  </button>
                </td>
              </tr>
            );
          })} */}

          {favorites.map((fav) => {
            const previousPrice = previousPrices[fav.api_id] || fav.price;
            console.log(fav.price, previousPrice);

            return (
              <tr
                key={fav.id}
                className="table-border-bottom text-center font-bold">
                <td>{fav.market_cap_rank}</td>
                <td>{fav.name}</td>
                <td
                  className={
                    fav.price > previousPrice
                      ? "up-price"
                      : fav.price < previousPrice
                      ? "down-price"
                      : ""
                  }>
                  {formatter.format(fav.price)}
                </td>
                <td>{formatter.format(fav.market_cap)}</td>
                <td className="pe-5">
                  <button
                    onClick={() => removeFromFavorites(fav)}
                    style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={faStar} style={{ color: "gold" }} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
