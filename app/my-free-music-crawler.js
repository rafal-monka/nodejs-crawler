var axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
// const BASE_URL = "https://download.my-free-music.icu/k/";
const BASE_URL = "https://my-free-music.icu"
const BASE_DOWNLOAD_URL = "https://my-free-music.icu/download.php?"
const DOWNLOAD_PATH = './download/mp3'

var Launcher = require("./launcher.js");

const agent = new SocksProxyAgent('socks5h://127.0.0.1:9150');

exports.run_scan = async () => {
    let list  = ['https://my-free-music.icu/band/15534.html']
    let pad = new Launcher(
        10,
        list,
        //callFunction,
        (item) => {
            console.log(item)
            try {
                return axios({
                    url: item,
                    methog: 'get',
                    httpsAgent: agent,
                    params: { }
                })
            } catch (error) {
                console.error(error);
            }
        },
        //callbackFunction,
        (item, html) => {
            var parser = new DomParser();
            var dom = parser.parseFromString(html.data);

            let arr = []
            try {
                let rows = dom.getElementsByClassName("uk-table")[0].getElementsByTagName('a')
                rows.forEach(
                    row => arr.push(
                         row.getAttribute('href')
                    //         .replace('/download/','')
                    //         .replace('.html','.mp3')
                    //         .split('-').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join('-')
                    )
                )                 
            } catch (e){
                console.error(e)
            }
            // console.log(arr)
            return arr
        },
        //catchFunction
        (error, item)=> {
            console.log('Launcher catchFunction', error.toString().substring(0,100), item)            
        },        
        //finalCallBack
        (param) => {
            console.log('final-run_scan-CallBack')
            console.log(param)
            this.run_getDownload(param[0].output)
        }
    );
    pad.run();
}


exports.run_getDownload = async (urls) => {
    let pad = new Launcher(
        1,
        urls,
        //callFunction,
        (url) => {
            console.log('getting...', BASE_URL+url)
            return axios({
                url: BASE_URL+url,
                methog: 'get',
                params: { }
            })    
        },
        //callbackFunction,
        async (item, html) => {
            var parser = new DomParser();
            var dom = parser.parseFromString(html.data)
            let dataid = dom.getElementsByClassName("download")[0].getAttribute('data-id')     
            let query = BASE_DOWNLOAD_URL+'download_key='+dataid+'&_='+Math.random()*100000000 //new Date().getTime()
            console.log(item, query)
            let url = await axios({
                url: query,
                httpsAgent: agent, //proxy
                methog: 'get',
                params: { }
            })   
            return url.data
        },
        //catchFunction
        (error, item)=> {
            console.log('Launcher catchFunction', error.toString().substring(0,100), item)            
        },        
        //finalCallBack
        (param) => {
            console.log('final-run_getDownload-CallBack')
            console.log(param)
        }
    );
    pad.run();
}

exports.run_download = async (gallery) => {
    let pad = new Launcher(
        10,
        gallery,
        //callFunction,
        downloadMP3,
        //callbackFunction,
        (item, param) => {
            new Promise((resolve, reject) => {
                param.data
                  .pipe(fs.createWriteStream(DOWNLOAD_PATH+'/'+item))
                  .on('finish', () => { 
                      resolve(); 
                      console.log(item, 'download ok')                       
                    } )
                  .on('error', e => { 
                      reject(e); 
                      console.error(item, e);                       
                    } );
            })
        },
        //catchFunction
        (error, item)=> {
            console.log('Launcher catchFunction', error.toString().substring(0,100), item)            
        },        
        //finalCallBack
        (param) => {
            console.log('final-download-CallBack');
        }
    );
    pad.run();
}


const downloadMP3 = (item) => {
    let url = item
    console.log('downloading...', url)
    return axios({
        url,
        responseType: 'stream',
    })  
    
}
