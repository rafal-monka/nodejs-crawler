var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const utils = require('./utils');

const BASE_URL = "http://podocenter.pl";

var Launcher = require("./launcher.js");


exports.run_lists = ()=> {
    let inputArray = [
        { url: 'brodawki-wirusowe.html', title: 'Usuwanie brodawek'},
        { url: 'Wrastajace-i-wkrecajace-paznokcie.html', title: 'Leczenie wrastających i wkręcających paznokci'},
        { url: 'Grzybica-stop-i-paznokci.html', title: 'Grzybica stóp i paznokci'},
        { url: 'Zielone-paznokcie.html', title: 'Zielone paznokcie'},
        { url: 'Modzel.html', title: 'Usuwanie modzeli'},
        { url: 'Onycholiza.html', title: 'Onycholiza'},
        { url: 'Odcisk.html', title: 'Usuwanie odcisków'},
        { url: 'Pekajace-piety.html', title: 'Pękające pięty'},
        { url: 'Podstawowy_zabieg.html', title: 'Podstawowy zabieg podologiczny'},
        { url: 'Sucha-skora.html', title: 'Sucha skóra'},
        { url: 'hiperkeratoza.html', title: 'Hiperkeratoza'}
    ]
    let outputArray = []

    // return 
    let pad = new Launcher(
        2, 
        inputArray, 
        //callFunction,
        getPodoPage,
        //callbackFunction,
        parsePodoPage,
        //finalCallBack
        (param) => {         
            param.forEach(el => {    
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
            //console.log('saving to file...', outputArray[0])
            if (true) outputArray.forEach(rec => {
                fs.writeFileSync('download/podocenter/podocenter-'+rec.url.replace('.html','').toLowerCase()+'.json', JSON.stringify({
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
    setTimeout(()=> {
        console.log(outputArray)
        console.log('saving to file...')
        fs.writeFileSync('download/podocenter/podocenter-ALL.json', JSON.stringify({
                "@context": "http://schema.org/",
                "@type": "Service",
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "itemListElement": outputArray
                }
        }));
    }, 10*1000)
}


getPodoPage = (item) => {    
    console.log('getPodoPage', item.url, item.title);
    try {
        return axios({
            url: BASE_URL+'/'+item.url,
            methog: 'get',
            params: { }
        })
    } catch (error) {
        console.log('###Error: getPodoPage');
        console.error(error);
    }
}


parsePodoPage = (item, html) => {  
    var parser = new DomParser();
    var dom = parser.parseFromString(html.data);
    
    let result = []
	try {
        let content = dom.getElementsByClassName('content-container')
        result = content[0].textContent.replace(/\n/g, '')
        //result = content[0].childNodes.length
        //result = content[0].childNodes.forEach(item => item.innerHTML)
        // for (let i=0; i<content[0].childNodes.length; i++) {
        //     result.push(JSON.stringify(content[0].childNodes[i].textContent.replace(/\n/g, '')))
        // }
        return result;        
	} catch (e) {
        console.error('###Error. parsePodoPage');
        console.error(item);        
        console.log(e);
		return result;
	}
}


