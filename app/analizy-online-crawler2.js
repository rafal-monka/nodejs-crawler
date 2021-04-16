var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const utils = require('./utils');
const puppeteer = require('puppeteer') //https://developers.google.com/web/tools/puppeteer/articles/ssr

const BASE_URL = "https://www.analizy.pl/fundusze-inwestycyjne-otwarte/notowania?&jednPodst=1&ryzykoOd=1&ryzykoDo=7&limit=100";

var Launcher = require("./launcher.js");

exports.run_lists = ()=> {

    let pad = new Launcher(
        6, 
        Array.from({length: 6}, (_, i) => i + 1), //1,2,...,6 lub [...Array(6).keys()].map(x => ++x)
        //callFunction,
        getList,
        //callbackFunction,
        parseList,
        //catchFunction
        (error, item)=> {
            console.log('Launcher catchFunction', error.toString().substring(0,100), item)            
        },
        //finalCallBack
        (param) => {
            console.log('final-Run-CallBack');
            //console.log(param);
            
            let funds = [];
            param.forEach(el => {
                console.log(el.item);
                el.output.forEach(p => {
                    funds.push(p);
                })
            })
            console.log('funds[1]', funds.length);
            funds = funds.sort((a,b) => a.name > b.name ? 1 : -1)
            console.log('funds[2]', funds.length);
            fs.writeFileSync('download/aol/list-'+(new Date().getTime())+'.json', JSON.stringify(funds))
            //call 
            
        } 
    );
    pad.run();
}



getList = (item) => {    
    console.log('getList', item);
    try {
        return new Promise(async function(resolve, reject) {
            try {
                const browser = await puppeteer.launch({
                    headless: true, 
                    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
                    //ignoreDefaultArgs: ['--disable-extensions']
                });
                const page = await browser.newPage();
                await page.goto(BASE_URL+'&page='+item, {waitUntil: 'networkidle0'});
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

getHTMLAttribute = (parentElement, elementName, nr, attributeName) => {
    try {
        return parentElement.getElementsByClassName(elementName)[nr].getAttribute(attributeName)
    } catch (e) {
        return 'Not found '+elementName+'['+nr+'].'+attributeName
    }
}

getHTMLinner = (parentElement, elementName, nr) => {
    try {
        return parentElement.getElementsByClassName(elementName)[nr].innerHTML
    } catch (e) {
        return 'Not found '+elementName+'['+nr+'].innerHTML'
    }
}

parseList = (item, html) => {  
    var parser = new DomParser();
    //console.log(html);

    var dom = parser.parseFromString(html)
    
    let result = []; 
	try {
        let fqc = dom.getElementById("fundsQuotationsContainer").getElementsByClassName('productContainer')     
        fqc.forEach( p => {
            let href = getHTMLAttribute(p, 'linkDiv', 0, 'href')
//            let title = getHTMLAttribute(p, 'linkDiv', 0, 'title')
            let name = getHTMLinner(p, 'productName', 0)
            let type = getHTMLinner(p, 'verticalLabelText', 0)
            let firm = getHTMLinner(p, 'productTypeInfo', 0)
            let info = getHTMLinner(p, 'productTypeInfo', 1)
            try {
                let tmp = href.replace('/fundusze-inwestycyjne-otwarte/','')
                result.push({
                    symbol: tmp.substring(0, tmp.indexOf('/')),
                    name: name,
                    href: href,
                    type: type,
                    firm: firm.replace('\n                        ','').replace('\n                    ',''),
                    info: info
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



