let fs = require("fs");
let cheerio = require("cheerio");
let request = require("request");

request(`https://www.espncricinfo.com/series/19322/scorecard/1187683`, function (err, res, html) {
    if (err === null && res.statusCode === 200) {
        parseHTML(html);
    } else if (res.statusCode === 404) {
        console.log("Invalid URL");
    } else {
        console.log(err);
        console.log(err.statusCode);
    }
})

function parseHTML(html) {
    let $ = cheerio.load(html);

    let playerName = "", maxWickets = 0;

    let loc = $(".scorecard-section.bowling tbody tr");
    for (let i = 0; i < loc.length; i++) {
        let name = $($(loc[i]).find("td")[0]).text();
        let wickets = $($(loc[i]).find("td")[5]).text();
        
        if (wickets > maxWickets) {
            maxWickets = wickets;
            playerName = name;
        }
    }
    fs.writeFileSync("Wickets.html", loc);
    console.log(playerName + "  " + maxWickets);
}