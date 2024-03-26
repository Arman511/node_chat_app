var news_data = "";
const news_container = document.getElementById("news_box");
const get_news = async () => {
    const response = await fetch("/api/tech_news");
    if (!response.ok) {
        const message = document.createElement("div");
        message.className = "error";
        message.innerHTML = `<h2>An error has occurred: ${response.statusText}</h2>`;
        news_container.appendChild(message);
        console.error("There was a problem with the fetch operation");
        return;
    }

    const data = await response.json();
    news_data = data;
    var content = [];
    news_data.forEach((news) => {
        const news_div = document.createElement("div");
        news_div.className = "news";
        news_div.innerHTML = `
            <h2><a href="${news.link}" target="_blank">${news.title}</a></h2>
            <h3>By: ${news.source}</h3>
            <a href="${news.link}" target="_blank"><img src="${news.og}" alt="Article image" style="max-width: 100%;"></img></a>
            <br>
            <a href="${news.link}" target="_blank">Read more</a>
        `;
        content.push(news_div.outerHTML);
    });
    news_container.innerHTML = content.join("<hr>");
};

get_news();
