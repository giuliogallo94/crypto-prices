import { useState, useEffect } from "react";
import SingleArticle from "../SingleArticle";

export default function Blog() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(
          "https://financialmodelingprep.com/stable/fmp-articles?apikey=zIWgPqm5b7P9sBP8SFzrihkzx7NigqLn"
        );

        if (!response.ok) {
          throw new Error(`Errore HTTP! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("❌ Errore: risposta non valida", data);
          return;
        }

        const first10Articles = data.slice(0, 10);
        console.log("✅ 10 Articoli ricevuti:", first10Articles);

        setArticles(first10Articles);
      } catch (error) {
        console.error("❌ Errore durante il recupero delle news:", error);
      }
    };

    fetchArticles();
  }, []);
  

  return <>
  <h1>Blog</h1>
    {articles.map((singleArticle) => {
      return (

        <SingleArticle key={singleArticle.title} singleArticle={singleArticle}/>
      )
    })
    }
  </>
}
