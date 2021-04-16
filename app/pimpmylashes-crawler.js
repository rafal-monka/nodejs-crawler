var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const storage = require('./pimpmylashes-storage')
const utils = require('./utils');

const BASE_URL = "https://www.pimpmylashes.pl/kategoria-produktu";

var Launcher = require("./launcher.js");

let array = [
    {category:'akcesoria', title: 'Akcesoria', count:36},
    {category:'browxenna', title: 'BrowXenna', count:38},
    {category:'cc-brow', title: 'CC Brow', count:28},
    {category:'dalashes', title: 'DaLashes', count:5},
    {category:'elan', title: 'ELAN', count:20},
    {category:'hulu', title: 'Hulu', count:4},
    {category:'lashbrow', title: 'Lash&Brow', count:2},
    {category:'levissime', title: 'Levissime', count:5},
    {category:'lifting-brwi-i-rzes', title: 'Lifting brwi i rzęs', count:24},
    {category:'materialy-dydaktyczne', title: 'Materiały dydaktyczne', count:4},
    {category:'ochrona-i-dezynfekcja', title: 'Ochrona i dezynfekcja', count:5},
    {category:'oswietlenie', title: 'Oświetlenie', count:3},
    {category:'oxygen-o2', title: 'Oxygen O2', count:8},
    {category:'paese', title: 'Paese', count:32},
    {category:'paese/cienie-do-powiek', title: 'Cienie do powiek', count:11},
    {category:'paese/korektory', title: 'Korektory', count:3},
    {category:'paese/kredka-do-brwi', title: 'Kredka do brwi', count:3},
    {category:'paese/linery-i-tusze-do-rzes', title: 'Linery i maskary do rzęs', count:1},
    {category:'paese/pielegnacja-paese', title: 'Pielęgnacja', count:5},
    {category:'paese/pomady-do-brwi', title: 'Pomady do brwi', count:3},
    {category:'paese/pudry-sypki', title: 'Pudry sypkie', count:4},
    {category:'pedzle-do-brwi', title: 'Pędzle do brwi', count:22},
    {category:'permanent-lashbrow', title: 'Permanent Lash&Brow', count:13},
    {category:'pielegnacja', title: 'Pielęgnacja', count:22},
    {category:'przedluzanie-rzes', title: 'Przedłużanie rzęs', count:66},
    {category:'przedluzanie-rzes/kleje', title: 'Kleje', count:9},
    {category:'przedluzanie-rzes/pesety', title: '+Pęsety', count:23},
    {category:'przedluzanie-rzes/preparaty', title: 'Preparaty', count:21},
    {category:'przedluzanie-rzes/rzesy', title: 'Rzęsy', count:2},
    {category:'przedluzanie-rzes/separacja', title: 'Separacja', count:11},
    {category:'szkolenia', title: 'Szkolenia', count:8},
    {category:'thuya-eyes', title: 'Thuya eyes', count:42},
    {category:'thuya', title: 'Thuya Nails', count:98},
    {category:'thuya/paznokcie', title: 'Paznokcie', count:96},
    {category:'woski-do-depilacji-twarzy', title: 'Woski do depilacji twarzy', count:2}    
]   

exports.run_lists = ()=> {
    let inputArray = []
    let outputArray = []
    array.map(item => {
        outputArray[item.category] = []
        console.log(Math.ceil(item.count/12))
        for (let i=1; i<=Math.ceil(item.count/12); i++) {
            inputArray.push({
                category: item.category,
                page: i    
            })    
        }
    })
    console.log(inputArray)

    // return 
    let pad = new Launcher(
        10, 
        inputArray, 
        //callFunction,
        getList,
        //callbackFunction,
        parseList,
        //finalCallBack
        (param) => {         
            let arr = []  
            //console.log('param', param)
            param.forEach(el => {                 
                //let outputArray = []               
                el.output.forEach(item => {
                    outputArray[el.item.category].push({
                        "@type": "ListItem",
                        "position": outputArray[el.item.category].length+1,
                        "item": {
                            //category: el.item.category,
                            title: el.item.title,
                            ...item
                        }
                    })
                    storage.store({
                        category: el.item.category,
                        id: item.id,
                        name: item.name,
                        price: 0.0,
                        description: ''
                    })  
                })                             
            })
              
            //console.log('param', param)
            //save to file
            // fs.writeFileSync('pimpmylashes-sample.json', JSON.stringify({            
            //     "@context": "http://schema.org",
            //     "@type": "BreadcrumbList",
            //     "itemListElement":outputArray
            // }));
        } 
    );
    pad.run();

    if (false) setTimeout(()=> {
        //console.log('final', outputArray)
        array.forEach(item => {
            console.log(item.category.replace('/','-'), outputArray[item.category].length)
            fs.writeFileSync('download/pimpmylashes-'+item.category.replace('/','-')+'.json', JSON.stringify({            
                    "@context": "http://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": outputArray[item.category]
            }));
        })
        //console.log(outputArray)
        // console.log('saving to file...')
        
    }, 60*1000)
}

exports.update_properties = () => {
    storage.getAll().then(recs => {
        console.log(recs.length)
        //return
        let pad = new Launcher(
            20, 
            recs, 
            //callFunction,
            getPimpPage,
            //callbackFunction,
            parsePimpPage,
            //finalCallBack
            (param) => { 
                //console.log('param', param[0])
                param.forEach((rec, index) => {
                    console.log('item', index)
                    storage.update(rec.item._id, rec.output)
                }) 
                //console.log('param', param)
                //save to file
                // fs.writeFileSync('pimpmylashes-sample.json', JSON.stringify({            
                //     "@context": "http://schema.org",
                //     "@type": "BreadcrumbList",
                //     "itemListElement":outputArray
                // }));
            } 
        );
        pad.run();

    })    
}


exports.saveToFiles = async () => {
    let outputArray = []
    array.map(item => outputArray[item.category] = [] )

    let recs = await storage.getAll()

    console.log(recs.length)
    recs.forEach(item => {
        outputArray[item.category].push({
            "@type": "ListItem",
            "position": outputArray[item.category].length+1,
            "item": {
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                description2: item.description2
            }
        })
    })

    array.forEach(item => {
        console.log(item.category.replace('/','-'), outputArray[item.category].length)
        fs.writeFileSync('download/pimpmylashes/pimpmylashes-'+item.category.replace('/','-')+'.json', JSON.stringify({            
                "@context": "http://schema.org",
                "@type": "BreadcrumbList",
                "category": item.title, 
                "itemListElement": outputArray[item.category]
        }));
    })
}


getList = (item) => {    
    console.log('getList', item.category, item.page);
    try {
        return axios({
            url: BASE_URL+'/'+item.category+'/page/'+item.page,
            methog: 'get',
            params: { }
        })
    } catch (error) {
        console.log('###Error: getList');
        console.error(error);
    }
}


parseList = (item, html) => {  
    var parser = new DomParser();
    var dom = parser.parseFromString(html.data);
    
    let result = []; 
	try {
        let products = dom.getElementsByClassName('product-name')
        products.forEach(product => {
            let a = product.childNodes[0]
            result.push({
                "id": a.getAttribute('href'),
                "name": a.innerHTML
            })
        })
        return result;        
	} catch (e) {
        console.error('###Error. parseList');
        console.error(item);        
        console.log(e);
		return result;
	}
}

getPimpPage = (item) => {
    //console.log('getPimpPage', item.id);
    try {
        return axios({
            url: item.id,
            methog: 'get',
            params: { }
        })
    } catch (e) {
        console.error('###Error. getPimpPage', item.id);
        //console.error(item);        
        //console.log(e);
        return 0;
    }
}

parsePimpPage = (item, html) => {  
    var parser = new DomParser();
    var dom = parser.parseFromString(html.data);
     
    let price = 0.0
    try {
        let tag = dom.getElementsByClassName('product_meta')[0].getElementsByClassName('woocommerce-Price-amount')[0]
        price = 1*utils.replaceHtmlEntites(tag.innerHTML).replace('&#122;&#322;','').replace(',','')
    } catch (e) {
        console.error('NO price', item.id);
    }

    let description = ''
    try {
        //console.log(dom.getElementsByClassName('short-description')[0].innerHTML)
        description = utils.replaceHtmlEntites(dom.getElementsByClassName('short-description')[0].innerHTML)
    } catch(e) {
        console.log('NO description', item.id)    
    }

    let description2 = ''
    try {
        let txt = dom.getElementById('content_tab_description').innerHTML //getElementsByClassName('tabs')[0]
        let iframe = txt.indexOf('iframe')
        if (iframe > -1) txt = txt.substr(0, iframe-1)  
        //console.log(utils.replaceHtmlEntites(txt))
        // console.log(dom.getElementById('content_tab_description').innerHTML)
        description2 = utils.replaceHtmlEntites(txt)
    } catch(e) {
        console.log('NO description2', item.id)    
    }    

    //console.log('price', price)
    return {
        price: price,
        description: description,
        description2: description2
    };   
	
}