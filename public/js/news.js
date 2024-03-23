var news_data = "";
const news_container = document.getElementById("news_box");
const get_news = async () => {
    const response = await fetch("/api/news");
    const data = await response.json();
    news_data = data;
    news_data.forEach((news) => {
        const news_div = document.createElement("div");
        news_div.className = "news";
        news_div.innerHTML = `
            <h2><a href="${news.link}" target="_blank">${news.title}</a></h2>
            <h3>By: ${news.source}</h3>
            <a href="${news.link}" target="_blank"><img src="${news.og}" style="max-width: 100%;"></img></a>
            <br/>
            <a href="${news.link}" target="_blank">Read more</a>
            <hr/>
        `;
        news_container.appendChild(news_div);
    });
};

get_news();
