const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const app = express();

app.get("/", async (req, res) => {
	const url = req.query.url;
	if (!url) {
		return res.status(400).send("Error: url parameter is required. \n Example: localhost:3000/?url=https://rabbitstream.net/v2/embed-4/WUq1kSx6ULrA?_debug=true");
	}

	try {
		puppeteer.use(StealthPlugin());
		const browser = await puppeteer.launch({
			headless: true,
		});
		const page = await browser.newPage();

		await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36");
		await page.setViewport({ width: 1366, height: 768 });
		await page.setRequestInterception(true);

		let responseSent = false;

		page.on("request", async (interceptedRequest) => {
			const request = interceptedRequest.url();
			if (request.endsWith("index.m3u8") && !responseSent) {
				responseSent = true;
				console.log(request);
				res.send(request);
				browser.close();
			} else {
				interceptedRequest.continue();
			}
		});

		await page.goto(url);
	} catch (error) {
		console.error("Error:", error);
		res.status(500).send("An error occurred.");
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
