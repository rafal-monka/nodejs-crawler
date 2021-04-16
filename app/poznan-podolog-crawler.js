var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const utils = require('./utils');

const BASE_URL = "https://poznan-podolog.com/services";

var Launcher = require("./launcher.js");


exports.run_lists = ()=> {
    let inputArray = [
        {url: 'wrastajace-paznokcie', title: 'Wrastający paznokieć'},
        {url: 'plastyka-walow-okolopaznokciowych', title: 'Plastyka wałów okołopaznokciowych'},
        {url: 'paznokiec-zmieniony-chorobowo', title: 'Paznokieć zmieniony chorobowo'},
        {url: 'stopa-cukrzycowa', title: 'Stopa cukrzycowa'},
        {url: 'usuwanie-odciskow', title: 'Usuwanie odcisków'},
        {url: 'grzybica', title: 'Grzybica stóp i paznokcia'},
        {url: 'retronychia', title: 'Retronychia'},
        {url: 'egzostoza-podpaznokciowa', title: 'Egzostoza podpaznokciowa'}        
    ]
    let outputArray = []

    // return 
    let pad = new Launcher(
        2, 
        inputArray, 
        //callFunction,
        getPoznanPodologPage,
        //callbackFunction,
        parsePoznanPodologPage,
        //finalCallBack
        (param) => {         
            param.forEach(el => {
                //console.log(el)      
                // outputArray.push(el)          
                outputArray.push({
                    "@type": "OfferCatalog",
                    "url": el.item.url,
                    "name": el.item.title,
                    "itemListElement": {
                        description: el.output
                    }
                })                               
            }) 
            
            //save to file
            console.log('saving to files...')
            if (true) outputArray.forEach(rec => {
                fs.writeFileSync('download/poznan-podolog/poznan-podolog-'+rec.url.toLowerCase()+'.json', JSON.stringify({
                        "@context": "http://schema.org/",
                        "@type": "Service",
                        "hasOfferCatalog": {
                            "itemListElement": rec
                        }
                }));
            })
        } 
    );
    pad.run()

    // return
    if (false) setTimeout(()=> {
        //console.log(outputArray)
        console.log('saving to file...')
        fs.writeFileSync('download/poznan-podolog/poznan-podolog-ALL.json', JSON.stringify({
                "@context": "http://schema.org/",
                "@type": "Service",
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "itemListElement": outputArray
                }
        }));
    }, 10*1000)
}


getPoznanPodologPage = (item) => {    
    console.log('getPoznanPodologPage', item.url, item.title);
    try {
        return axios({
            url: BASE_URL+'/'+item.url,
            methog: 'get',
            params: { }
        })
    } catch (error) {
        console.log('###Error: getPoznanPodologPage');
        console.error(error);
    }
}


parsePoznanPodologPage = (item, html) => {  
    var parser = new DomParser();
    var dom = parser.parseFromString(html.data);
    
    let result
	try {
        let sections = dom.getElementsByTagName('article')[0].getElementsByTagName('section')
        let txt = sections[1].textContent
        let endTagPos = txt.indexOf('<!--')
        if (endTagPos > -1) txt = txt.substr(0, endTagPos-1)  
        result = {
            header: sections[0].textContent,//innerHTML,
            text:  txt//utils.replaceHtmlEntites(sections[1].innerHTML)//textContent <!--
        }
        //console.log('result', result)
        return result;        
	} catch (e) {
        console.error('###Error. parsePoznanPodologPage');
        console.error(item);        
        console.log(e);
		return result;
	}
}


