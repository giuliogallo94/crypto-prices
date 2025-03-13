import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import PagesChange from "./PagesChange";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function CryptoTable() {
  const [allCoins, setAllCoins] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
 
  const { register, setValue, watch, handleSubmit, reset } = useForm();
  const transactionQuantity = watch("transactionQuantity", 0); 
  const transactionPrice = watch("transactionPrice", 0);
  const transactionType = watch("transactionType", "1");
  const token = localStorage.getItem("token");

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });

  useEffect(() => {
    setValue("transactionTotal", transactionQuantity * transactionPrice);
  }, [transactionQuantity, transactionPrice, setValue]);

  const toggleModal = (coin = null) => {
    setIsOpen(!isOpen);
    setSelectedCoin(coin);

    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 16);
    
    setValue("transactionDate", formattedDateTime);
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token){

      fetch("http://127.0.0.1:8000/api/favorites", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => response.json())
      .then((data) => setFavorites(data.data))
      .catch((error) => console.error("Errore:", error));
    }
  }, []);

  useEffect(() => {
    async function fetchAllCoins() {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-cg-demo-api-key": "CG-JkDsPKgv5Bu9YwXem25x64dU",
        },
      };

      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10&page=${pageNumber}`,
        options
      )
        .then((res) => res.json())
        .then((res) => setAllCoins(res))
        .catch((err) => console.error(err));
    }

    fetchAllCoins();

    const interval = setInterval(() => {
      fetchAllCoins();
    }, 10000);

    return () => clearInterval(interval);
  }, [pageNumber]);

  const updatePortfolio = async (crypto, formData) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/portfolios/${crypto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,

          },
          body: JSON.stringify({
            api_id: crypto.id,
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
      reset()

      // Chiude il modal dopo il successo
      toggleModal();
    } catch (error) {
      console.error("Errore:", error.message);
    }
  };

  const addToFavorites = async (crypto) => {
    const token = localStorage.getItem("token"); // Recupera il token dal localStorage

    try {
      const response = await fetch("http://127.0.0.1:8000/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          api_id: crypto.id,
          market_cap_rank: crypto.market_cap_rank,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          price: crypto.current_price,
          market_cap: crypto.market_cap,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore nell'aggiunta ai preferiti");
      }

      const data = await response.json();
      if (data.success) {
        setFavorites((prevFavorites) => [
          ...prevFavorites,
          {
            api_id: crypto.id,
            market_cap_rank: crypto.market_cap_rank,
            symbol: crypto.symbol,
            name: crypto.name,
            image: crypto.image,
            price: crypto.current_price,
            market_cap: crypto.market_cap,
          },
        ]);
      }
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  const removeFromFavorites = async (crypto) => {
    const token = localStorage.getItem("token"); // Recupera il token dal localStorage

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/favorites/${crypto.name}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,

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
      <h2 className="table-title my-5">Cryptocurrencies by Market Cap</h2>

      <table className="crypto-table border table-fixed rounded-xl">
        <thead>
          <tr className="row-table-head table-border-bottom">
           {token && <th className="w-10"></th>}
            <th className="w-25">Rank</th>
            <th>Cryptocurrency</th>
            <th>Price</th>
            <th>Market Cap</th>
            <th>24H Change</th>
           {token && <th className="w-10"></th>}
          </tr>
        </thead>
        <tbody className="table-border-bottom">
          {allCoins.map((singleCoin) => {
            const existInFavorite = favorites.some(
              (coin) => coin.name === singleCoin.name
            );

            return (
              <tr
                className="table-border-bottom text-center font-bold"
                key={singleCoin.id}>
                {token &&
                <td className="ps-5">
                  <button
                    onClick={() =>
                      existInFavorite
                      ? removeFromFavorites(singleCoin)
                      : addToFavorites(singleCoin)
                    }
                    className="pointer">
                    <FontAwesomeIcon
                      style={existInFavorite ? { color: "gold" } : ""}
                      icon={faStar}
                      />
                  </button>
                </td>
                    }
                <td>{singleCoin.market_cap_rank}</td>
                <td className="flex items-center crypto-name">
                  <img
                    src={singleCoin.image}
                    className="crypto-logo mr-5"
                    alt=""
                  />
                  <Link to={`/crypto/${singleCoin.id}`} state={{ crypto: singleCoin }}>
                    <h3>{singleCoin.name}</h3>
                  </Link>
                </td>
                <td>{formatter.format(singleCoin.current_price)}</td>
                <td>{formatter.format(singleCoin.market_cap)}</td>
                <td
                  className={
                    singleCoin.price_change_24h < 0 ? "down-price" : "up-price"
                  }>
                  {formatter.format(singleCoin.price_change_24h)}
                </td>
                  {token &&
                <td className="pe-5">
                  <button
                    className="pointer"
                    onClick={() => toggleModal(singleCoin)}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </td>
                    }
              </tr>
            );
          })}
        </tbody>
      </table>
      {isOpen && (
        <div
          id="transaction-modal"
          className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <div className="flex justify-between mb-4 items-center grid-cols-3">
              <h2 className="text-xl font-bold">Transaction</h2>
              <button type="button" className="pointer" onClick={() => {toggleModal(); reset()}}>
                x
              </button>
            </div>

            {/* Form per inserire i dati */}
            {/* <form onSubmit={handleSubmit((data) => updatePortfolio(data))}> */}
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
                  className="mt-1 p-2 w-full border rounded-md"
                  >
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
                  onClick={() =>
                    setValue("transactionPrice", selectedCoin.current_price)
                  }
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
                {...register ("transactionNote")}
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
      <PagesChange pageNumber={pageNumber} onPageChange={handlePageChange} />
    </div>
  );
}
