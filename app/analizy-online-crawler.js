var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const utils = require('./utils');
const puppeteer = require('puppeteer') //https://developers.google.com/web/tools/puppeteer/articles/ssr

const aolstorage = require("./aol-storage.js");
// const db = require("./models-OLD/index.js");
// const Op = db.Sequelize.Op;
// const AOL = db.AOL;
const BASE_URL = "https://www.analizy.pl/fundusze-inwestycyjne-otwarte/notowania?&jednPodst=1&page=1&segment[]=AR&ryzykoOd=1&ryzykoDo=7&limit=100";
const DOWNLOAD_PATH = './app/download/'

var Launcher = require("./launcher.js");

exports.run_lists = ()=> {
    
    let pad = new Launcher(
        3, 
        [
            {TFI:'TFIING'}, //NN
            {TFI:'TFIPZU'}, //PZU  
            {TFI:'TFISKR'}, //Skarbiec
            {TFI:'TFIBZW'}, //Santander
            {TFI:'TFIPIO'}, //pekao
            {TFI:'TFIPCS'}, //pko
            {TFI:'TFIBPH'}, //mbank
            {TFI:'TFIUNI'}, //generali
            {TFI:'TFISUP'}, //Superfund
            {TFI:'TFIAIG'}, //AIG                        
        ], 
        //callFunction,
        getList,
        //callbackFunction,
        parseList,
        //finalCallBack
        (param) => {
            console.log('final-Run-CallBack');
            //console.log(param);
            
            let funds = [];
            param.forEach(el => {
                console.log(el.item.TFI);
                el.output.forEach(p => {
                    funds.push({
                        TFI: el.item.TFI, fund_url: p.href, fund_title: p.title
                    });
                })
            })
            console.log('funds', funds);

            //call 
            this.run_links(funds);
            
        } 
    );
    pad.run();
}

exports.run_links = (links) => {
    let pad = new Launcher(
        5,
        links,
        //callFunction,
        getPage,
        //callbackFunction,
        parsePage,
        //finalCallBack
        (param) => {
            //console.log('final-Store-CallBack');
            //console.log(param);
            param.forEach(el => {
                let fundPage = {
                    tfi: el.item.TFI,
                    name: el.item.fund_title,
                    url: el.item.fund_url,
                    ir: el.output ? el.output.ir : 0,
                    stdv: el.output ? el.output.stdV : 0,
                    sharpe: el.output ? el.output.sharpe : 0,
                    info: JSON.stringify(el.output)
                }   
                console.log(fundPage.name)   
                aolstorage.storeFund(fundPage)
                    .then(data => {
                        console.log('ok');
                    })
                    .catch(err => {
                        console.log(err);
                    });          
            })
            console.log(param.length);    
        } 
    );
    pad.run();
}

getList = (item) => {    
    console.log('getList', item.TFI);
    try {
        return new Promise(async function(resolve, reject) {
            try {
                const browser = await puppeteer.launch({
                    headless: true, 
                    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
                    //ignoreDefaultArgs: ['--disable-extensions']
                });
                const page = await browser.newPage();
                await page.goto(BASE_URL+'&firmaZarz[]='+item.TFI, {waitUntil: 'networkidle0'});
                const html = await page.content(); // serialized HTML of page DOM.
                await browser.close();
                resolve(html);
            } catch (e) {
                reject('SOMETHING WRONG '+e)
            }
        })

    } catch (error) {
        console.log('###Error: getList');
        console.error(error);
    }
}

getPage = (item) => {    
    return new Promise(async function(resolve, reject) {
        try {
            const browser = await puppeteer.launch({
                headless: true, 
                executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
                //ignoreDefaultArgs: ['--disable-extensions']
            });
            const page = await browser.newPage();
            await page.goto('https://www.analizy.pl'+item.fund_url, {waitUntil: 'networkidle0'});
            const html = await page.content(); // serialized HTML of page DOM.
            await browser.close();
            resolve(html);
        } catch (e) {
            reject('SOMETHING WRONG '+e)
        }
    })
}

parseList = (item, html) => {  
    var parser = new DomParser();
    //console.log(html);

    var dom = parser.parseFromString(html)
    
    let result = []; 
	try {
        let fqc = dom.getElementById("fundsQuotationsContainer").getElementsByClassName('productContainer')     
        fqc.forEach( p => {
            let link = p.getElementsByClassName('linkDiv')
            try {
                let fund = link[0]               
                result.push({
                    title: fund.getAttribute('title'),
                    href: fund.getAttribute('href')
                });                
            } catch (e) {
                console.error('###Error. parseList1');
                console.error(item);
                console.error(e);  
            }    
        })
        return result;
        
	} catch (e) {
        console.error('###Error. parseList');
        console.error(item);        
        console.log(e);
		//console.log(html);
		return result;
	}
}

parsePage = (item, html) => {  
    //console.log('parsePage');
    //console.log(html.data);
	var parser = new DomParser();
    var dom = parser.parseFromString(html)

    let arr = []
    try {
        let tmp = dom.getElementsByClassName("tableRiskRating");
        //console.log('tableRiskRating',tmp.length);
        tmp.forEach((el,inx) => {
            if (inx>0) arr.push(
                utils.replaceHtmlEntites(el.getElementsByClassName('active')[0].innerHTML)
            )
        })   
    } catch (e) {      
        console.error('###Error. Can not find tableRiskRating');
    }

    if (arr.length===3) {
         result = {
             ir: arr[0],
             stdV: arr[1],
             sharpe: arr[2]
         }
    } else {
        result = null
    }

    return result;
}

