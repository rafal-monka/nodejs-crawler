var axios = require('axios');
var DomParser = require('dom-parser');
var HTMLParser = require('node-html-parser');
const fs = require('fs');
const utils = require('./utils');
const vgstorage = require("./vggallery-storage.js");
const db = require("./models");
const Op = db.Sequelize.Op;
const vggalleryPictures = db.vggallery;
const BASE_URL = "http://www.vggallery.com/";
const DOWNLOAD_PATH = './download/'

var Launcher = require("./launcher.js");

exports.run_lists = ()=> {
    //performCrawl('drawings','main_ac.htm'); 
    //return;
    let pad = new Launcher(
        2, 
        [
            // {category: 'watercolours', main: 'main.htm'},
            
            {category: 'painting', main: 'main_se.htm'},

            // {category: 'painting', main: 'main_ac.htm'},
            // {category: 'painting', main: 'main_df.htm'},
            // {category: 'painting', main: 'main_gi.htm'},
            // {category: 'painting', main: 'main_jl.htm'},
            // {category: 'painting', main: 'main_mo.htm'},
            // {category: 'painting', main: 'main_pr.htm'},
            // {category: 'painting', main: 'main_su.htm'},
            // {category: 'painting', main: 'main_vz.htm'},

            // {category: 'drawings', main: 'main_ac.htm'},
            // {category: 'drawings', main: 'main_df.htm'},
            // {category: 'drawings', main: 'main_gi.htm'},
            // {category: 'drawings', main: 'main_jl.htm'},
            // {category: 'drawings', main: 'main_mo.htm'},
            // {category: 'drawings', main: 'main_pr.htm'},
            // {category: 'drawings', main: 'main_su.htm'},
            // {category: 'drawings', main: 'main_vz.htm'}            
        ], 
        //callFunction,
        getList,
        //callbackFunction,
        parseList,
        //finalCallBack
        (param) => {
            console.log('final-Run-CallBack');
            //console.log(param);
            
            let pictures = [];
            param.forEach(el => {
                console.log(el.item.category, ';', el.item.main, ';', el.output.length);
                el.output.forEach(p => {
                    pictures.push({category: el.item.category, main: el.item.main, href: p.href});
                })
            })
            console.log(pictures.length);

            //call 
            this.run_pages(pictures);
            
        } 
    );
    pad.run();
}

exports.run_pages = (gallery) => {
    let pad = new Launcher(
        5,
        gallery,
        //callFunction,
        getPage,
        //callbackFunction,
        parsePage,
        //finalCallBack
        (param) => {
            console.log('final-Store-CallBack');
            //console.log(param);
            param.forEach(el => {
                let picture = {
                    category: el.item.category,
                    main: el.item.main,
                    page: el.item.href,
                    image: el.output.src,                    
                    title: el.output.title,
                    description: '',
                    origin: '',
                    location: ''
                }      
                vgstorage.storeVggalleryPicture(picture)
                    .then(data => {
                        //console.log('ok');
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

exports.run_download = async () => {
    //gallery = await vggalleryPictures.findAll({ where: {image: {[Op.not]:''}}, raw: true});
    gallery = await vggalleryPictures.findAll({ /*where: {location: '1', description: ''},*/ raw: true});

    // gallery.forEach((e, index) => {
    //     console.log(index, BASE_URL+e.category+'/'+e.image, DOWNLOAD_PATH+e.category+'/'+e.image);
    //     download(e);
    // })
    
    let pad = new Launcher(
        10,
        gallery,
        //callFunction,
        download,
        //callbackFunction,
        (item, param) => {
            new Promise((resolve, reject) => {
                param.data
                  .pipe(fs.createWriteStream(DOWNLOAD_PATH+item.category+'/'+item.image))
                  .on('finish', () => { 
                      resolve(); console.log('ok') 
                      vggalleryPictures.update({description: 'ok'}, {
                        where: { id: item.id }
                      })
                    } )
                  .on('error', e => { 
                      reject(e); console.error(e);
                      vggalleryPictures.update({description: e}, {
                        where: { id: item.id }
                      }) 
                    } );
            })
        },
        //finalCallBack
        (param) => {
            console.log('final-download-CallBack');
        }
    );
    pad.run();
}


const download = (item) => {
    let url = BASE_URL+item.category+'/'+item.image;
    return axios({
        url,
        responseType: 'stream',
    })  
    
}

const download_OLD = (item) => {
  let url = BASE_URL+item.category+'/'+item.image, 
      image_path = DOWNLOAD_PATH+item.category+'/'+item.image
  axios({
    url,
    responseType: 'stream',
  }).then(
    response => {
      return new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => { resolve(); console.log('ok') } )
          .on('error', e => { reject(e); console.error(e) } );
      })
    }
  );
}



scanPages = async (arr) => {
    console.log('scanPages');
    //###@@@
    let l = arr.length;
    l= 1;
    for (var p=0; p<2; p++) {
        console.log('scanPages', arr[p].category+'/'+arr[p].href);
        await getPage(arr[p].category+'/'+arr[p].href)
            .then(response => {                
                let picture = parsePage(arr[p].href, response.data);
                let img_url = BASE_URL+arr[p].category+'/'+picture.src;
                console.log(img_url, picture);
                // download(img_url, DOWNLOAD_PATH+img_file).then(()=> {
                //     console.log('Done', img_file);
                // });
            })
            .catch(error => {
                console.log('ERROR', error);
            })            
}
}

getList = (item) => {    
    console.log('getList', item.category, item.main, BASE_URL+item.category+'/'+item.main);
    try {
        return axios({
            url: BASE_URL+item.category+'/'+item.main,
            methog: 'get',
            params: { }
        })
    } catch (error) {
        console.log('###Error: getList');
        console.error(error);
    }
}

getPage = (item) => {    
    //console.log('getPage', item.category, item.href, BASE_URL+item.category+'/'+item.href);
    try {
        return axios({
            url: BASE_URL+item.category+'/'+item.href,
            methog: 'get',
            params: { }
        })
    } catch (error) {
        console.log('###Error: getPage');
        console.error(error);
    }
}

parseList = (item, html) => {  
	//console.log('parseList', category);
    var parser = new DomParser();
    //console.log(html);
    var dom = parser.parseFromString(html.data);
    
    let result = []; 
	try {
        let as = dom.getElementsByTagName("table")[0].getElementsByTagName("a");       
        as.forEach( a => {
            try {
                if (a.getAttribute('href').substr(0,2) === 'p_') {
                    result.push({
                        href: a.getAttribute('href')
                    });
                }
            } catch (e) {
                console.error('###Error. parseList1');
                console.error(item);
                console.error(e);  
            }    
        })
        return result;
        
	} catch (e) {
        console.error('###Error. parseList2');
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
    var dom = parser.parseFromString(html.data);

    let result = {src: '', title: ''}; 

    //title
    try {
        let tmp = dom.getElementsByTagName("h2")[0].innerHTML;
        tmp = tmp.substr(6, tmp.indexOf('</b>')-6);
    // console.log(tmp);       
        result.title = tmp;
    } catch (e) {
        console.error(item);        
        console.error('###Error. Can not find h2');
    }

    //img src    
    
    try {
        let imgs = dom.getElementsByTagName("img");  
        imgs.forEach( img => {
            let err = 0;
            try {
                let s1 = img.getAttribute('src');
                if (s1.substring(0,2) === 'f_' || s1.substring(0,3) === 'jh_') result.src = s1;
            } catch (e) {
                err = 1;
            }
            try {
                let s2 = img.getAttribute('SRC');
                if (s2.substring(0,2) === 'f_' || s1.substring(0,3) === 'jh_') result.src = s2;
            } catch (e) {
                err = 2;
            }      
            //###???  
            // if (err > 0 && result.src == '') {
            //     console.error(item);
            //     console.error('###Error. src/SRC',err, result.src == '');
            // }    
        })
    } catch (e) {
        console.error(item);        
        console.error('###Error. Can not find img',result.title);
    } 
//     //desc
//     let desc = dom.getElementsByTagName("p")[3];
//     result[0].other = desc.innerHTML;

    return result;
}


//----------------
parseListTest = (category, html) => {  
    console.log('parseList');
    //let html2 = html.replace("\<tr\>\<td valign=top\>\<b\>\<h4 align=center\>Name\</b\>\</td\>\<td\>\<b\>\<h4 align=center\>Origin\</b\>\</td\>\<td\>\<b\>\<h4 align=center\>Current Location\</b\>\</td\>\<td\>\<b\>\<h4 align=center\>F\</b\>\</td\>\<td\>\<b\>\<h4 align=center\>JH\</b\>\</td\>\</tr\>","")
	//var parser = new DomParser();
    var dom = HTMLParser.parse(html);

    // console.log(html);
    
    let result = []; 
	try {
        let t = dom.querySelector("table"); 
        //let tr = t.getElementsByTagName("tr"); 
        //console.log();
        console.log(t);
        //t.removeChild(tr[0]);            
        tr = t.parentNode.childNodes; 
        console.log(tr.length);
        tr.forEach(n => {
            console.log(n.innerHTML);
        })
        // //let td = tr[0].getElementsByTagName("td");
        // //console.log(td.length);

        // tb = dom.getElementsByTagName("table")[0],
        //     tableRows = tb.getElementsByTagName("tr");
            
        //var r = [], i, tds, j;

        // for ( i = 0; i<tr.length; i++) {
        //     console.log(i);
        //     tds = tr[i].getElementsByTagName('td');
        //     console.log(tds.length);        
        //     for( j = 0; j < tds.length; j++) {
        //         console.log(tds[j].innerHTML);
        //     }
        // }
        // for (var r = 0; r < t.rows.length; r++) {
        //     for (var c = 0; c < t.rows[r].cells.length; c++) {
        //         console.log(t.rows[r].cells[c].innerHTML)
        //     }
        // }
        return result;
        
	} catch (e) {
        console.log('###ERROR', e);
		console.log('parseList - no results');
		return null;
	}
}

//
// performCrawl = async (category, page) => {
//     console.log('performCrawl');
// 	await getList({category: category, page: page})
//         .then(response => {
// 			console.log("performCrawl response.data", response.data);
// 			let result = parseList(response.data);	
//             console.log(JSON.stringify(result));
//             //scanPages(result);
// 		})
// 		.catch(error => {
// 			console.log('ERROR', error);
// 		})
// }



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