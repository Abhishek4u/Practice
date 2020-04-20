let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");
let count = 0, leaderboard = [];

request(`https://www.espncricinfo.com/scores/series/19322`, function (err, res, html) {
    if (err === null && res.statusCode === 200) {
        parseSeries(html);
    } else if (res.statusCode === 404) {
        console.log("Invalid URL");
    } else {
        console.log(err);
        console.log(err.statusCode);
    }
})

function parseSeries(html) {
    let d = cheerio.load(html);
    let matches = d(".cscore.cscore--final.cricket.cscore--watchNotes");
    //select only t20 and odi matches
    fs.writeFileSync("board.html", matches);
    for (let i = 0; i < matches.length; i++) {
        let matchType = d(matches[i]).find(".cscore_info-overview").html();

        let type = matchType.includes("ODI") || matchType.includes("T20I");

        if (type == true) {
            // console.log(matchType);
            let link = d(matches[i]).find(".cscore_buttonGroup a").attr("href");
            let matchlink = `https://www.espncricinfo.com${link}`;
            // console.log(matchlink);
            goToMatchPage(matchlink);
        }
    }
}

function goToMatchPage(matchlink) {
    count++;
    request(matchlink, function (err, res, html) {
        if (err === null && res.statusCode === 200) {
            handleMatch(html);
            count--;
            if (count == 0) {
                console.table(leaderboard);
            }
        } else if (res.statusCode === 404) {
            console.log("Invalid URL");
        } else {
            console.log(err);
            console.log(err.statusCode);
        }
    })
}

function handleMatch(html) {
    let d = cheerio.load(html);

    let format = d(".cscore_link.cscore_link--button .cscore_info-overview").html();
    format = format.includes("ODI") ? "ODI" : "T20I";

    let teams = d(".sub-module.scorecard h2");
    let innings = d(".sub-module.scorecard");

    for (let i = 0; i < innings.length; i++) {

        let batsmenRows = d(innings[i]).find(".wrap.batsmen");
        let team = d(teams[i]).text();

        for (let br = 0; br < batsmenRows.length; br++) { //batsmen row
            let nameOfPlayer = d(batsmenRows[br]).find(".cell.batsmen").text();
            let scoreOfPlayer = d(batsmenRows[br]).find(".cell.runs").html();
            handlePlayer(nameOfPlayer, scoreOfPlayer, team, format);
        }
    }
}

function handlePlayer(name, runs, team, format) {
    runs = Number(runs);

    for (let i = 0; i < leaderboard.length; i++) {
        let cObj = leaderboard[i];
        if (cObj.Name == name && cObj.Format == format && cObj.Team == team) {
            cObj.Runs += runs;
            return;
        }
    }

    let obj = {
        Name: name,
        Runs: runs,
        Team: team,
        Format: format
    }
    leaderboard.push(obj);
}