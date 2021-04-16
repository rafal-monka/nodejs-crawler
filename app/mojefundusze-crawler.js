var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const utils = require('./utils');

const BASE_URL = "https://mojefundusze.pl/Fundusze/Inwestycyjne/";

var Launcher = require("./launcher.js");

exports.run_lists = ()=> {
    let pad = new Launcher(
        7, 
        [
            {
                code: 'nn-obligacji',
                startDate: '2020-07-02',  
                startValue: 345.96, 
                capital: 100000.0
            },
            // {
            //     code: 'nn-obligacji',
            //     startDate: '2020-08-08',  
            //     startValue: 0.0, 
            //     capital: 60000.0
            // },
            {
                code: 'SKARBIEC-Obligacja', 
                startDate: new Date('2020-08-09'),                 
                startValue: 0.0, 
                capital: 20000.0
            },
            {
                code: 'SKARBIEC-Sek-Nieruch', 
                startDate: new Date('2020-08-09'),
                startValue: 0.0, 
                capital: 20000.0
            },
            {
                code: 'Santander-Obligacji-Skarbowych-A', 
                startDate: new Date('2020-06-30'), 
                startValue: 23.57, 
                capital: 100000.0
            },
            {
                code: 'Santander-Prestiz-Obligacji-Skarbowych',
                startDate: new Date('2020-06-30'),  
                startValue: 1500.86, 
                capital: 100000.0
            },
            {
                code: 'Santander-Akcji-Polskich-A', 
                startDate: new Date('2020-06-25'), 
                startValue: 0.0, 
                capital: 1000.0
            },
            {
                code: 'Pekao-Obligacji-Dynamiczna-Alokacja-2-FIO', 
                startDate: new Date('2020-08-10'), 
                startValue: 0.0,
                capital: 200000.0
            }
            // '',Quercus
        ], 
        //callFunction,
        getFund,
        //callbackFunction,
        parseFund,
        //finalCallBack
        (param) => {         
            let arr = []  
            let diff
            let interests
            param.forEach(el => {
                //console.log(el)
                if (el.item.startValue > 0) {
                    diff = (el.output.value - el.item.startValue) / el.item.startValue
                    interests = Math.round(diff * el.item.capital * 100) / 100
                    arr.push({
                        code: el.item.code,
                        fund: el.output.title,
                        startDate: el.item.startDate,
                        startValue: el.item.startValue,
                        date: new Date(el.output.date),
                        value: el.output.value,
                        diff: Math.round(diff * 100 * 100)/100,
                        interests: interests,
                        interests_net: Math.round(interests*0.81*100)/100
                    })  
                }              
            })
            console.log(arr)
            let total = arr.reduce((total,item) => total+item.interests_net, 0 )
            console.log('total', total)
            //call 
            //this.run_links(funds);
            
        } 
    );
    pad.run();
}


getFund = (item) => {    
    console.log('getFund', item.code);
    try {
        return axios({
            url: BASE_URL+item.code,
            methog: 'get',
            params: { }
        })
    } catch (error) {
        console.log('###Error: getFund');
        console.error(error);
    }
}


parseFund = (item, html) => {  
    var parser = new DomParser();
    var dom = parser.parseFromString(html.data);
    
    let result = {}; 
	try {
        result = {
            title: dom.getElementsByTagName('title')[0].innerHTML,
            value: 1*dom.getElementsByTagName('h1')[1].innerHTML.replace('PLN','').replace(' ','').replace(',','.'),
            date: dom.getElementsByTagName('h3')[0].getElementsByTagName('strong')[0].innerHTML
        }
        return result;        
	} catch (e) {
        console.error('###Error. parseFund');
        console.error(item);        
        console.log(e);
		//console.log(html);
		return result;
	}
}




//------------------------------------------------------
exports.testPage = () => {
    tmp = [ { category: 'painting', href: 'p_0086.htm' },
            { category: 'watercolours', href: 'p_0851.htm'},
            { category: 'drawings', href: 'p_0908.htm'}
          ];
    tmp.forEach(e => {
        getPage(e).
            then(response => {
                let res = parsePage(response);
                console.log(res);
            })
    })
}