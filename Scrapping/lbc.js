let request = require("request");
let fs = require("fs");
let cheerio = require("cheerio");

request(`https://www.espncricinfo.com/series/19322/commentary/1187683`, function(err,res,html) {
	if(err===null && res.statusCode===200) {
		parseHTML(html);
	} else if(res.statusCode===404) {
		console.log("Invalid URL");
	} else {
		console.log(err);
		console.log(err.statusCode);
	}
})

function parseHTML(html) {
	let d = cheerio.load(html);
	let data = d(".item-wrapper .description");
    fs.writeFileSync("data.html",data);
    let printing = d(data[0]).text();
    console.log(printing);
}