import PropTypes from "prop-types";

export default function SingleArticle({ singleArticle }) {
  function stripHtml(html) {
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  }

  return (
    <div id="single-article" className="flex flex-col">
      {singleArticle.image && (
        <img
          src={singleArticle.image}
          alt="article image"
          className="article-image w-full h-auto"
        />
      )}
      <h2 className="p-3 text-center font-bold">{singleArticle.title}</h2>

      <p className="px-2">{stripHtml(singleArticle.content)}</p>
      <a className="read-more" href={singleArticle.link} target="_blank">
        <span>Read more</span>
      </a>
    </div>
  );
}

// ✅ Aggiunto PropTypes alla funzione corretta
SingleArticle.propTypes = {
  singleArticle: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    link: PropTypes.string,
    image: PropTypes.string, // L'immagine può essere opzionale
  }).isRequired,
};
