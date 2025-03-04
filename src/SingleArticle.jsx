export default function SingleArticle(props) {
    return <div id="single-article" className="flex flex-col p-5">
        <h2>{props.singleArticle.title}</h2>
        {/* <img src="" alt="article image" /> */}
        <p>Articlo content</p>
    </div>
}