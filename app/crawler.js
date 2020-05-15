var axios = require('axios');
var DomParser = require('dom-parser');
const storage = require("./storage.js");
const sT = require("../config/global.js");

exports.run = async ()=> {
	sT.currentScan = 0;
	perform(1); //page
}

perform = async (page) => {
	console.log('perform scan', sT.currentScan);
	if (sT.currentScan >= sT.scanTables.length) {
		console.log('END OF PROCESSING');
		return;		
	}
	var v = sT.scanTables[sT.currentScan];
	console.log('perform scan params', v);

	console.log('perform page', page);

	await getList(v.lang, v.category, v.price_from, v.price_to, page)
        .then(response => {
			//console.log("response.data", response.data);
			let result = parsePage(response.data);	
			//console.log('result',result);
			result.books.forEach(book => {
				console.log('book.title',book.title);  
				book.category = v.category; 
				book.lang = v.lang;
				//storage.storeBook(book);
			});

			//move to next page of results
			if (result.ifnext === 1) {
				perform(page+1);
			//move to next scan 
			} else {
				console.log('GO NEXT SCAN ARRAY');
				sT.currentScan++;
				perform(1); 
			}
		})
		.catch(error => {
			console.log('ERROR', error);
			//res.status(404).send('Not found');
		})
}

getList = (lang, category, price_from, price_to, page) => {
    const CONST_URL = "https://krainaksiazek.pl/sklep.html?author=&keyword=&isbn13=&publisher=&bisac=&action=search&type=adv&md=products_searcher";
    try {
        return axios({
            url: CONST_URL,
            methog: 'get',
            params: {
				p_lang: lang,
				p_price_from: price_from,
				p_price_to: price_to,
				pg: page,
				ct_id: category
            }
        })
    } catch (error) {
        console.log('###Error: getTranslation');
        console.error(error);
    }
}

parsePage = (html) => {    
//console.log('parse');
    var parser = new DomParser();
    var dom = parser.parseFromString(html);
	let books = [];
	let mainNode;
	try {
    	mainNode = dom.getElementsByClassName('category_products')[0].childNodes[0];
	} catch (e) {
		console.log('parsePage - no results');
		return {
			books: [], 
			ifnext: 0
		};
	}

	let tables = mainNode.getElementsByTagName('table');
	console.log('tables.length', tables.length);

	tables.forEach(element => {
		let plb = element.getElementsByClassName('product_list_box')[0];
		let price = element.getElementsByClassName('product_price_with_tax_list')[0].innerHTML.replaceHtmlEntites();
		let title = plb.getElementsByTagName('a')[0].innerHTML.replaceHtmlEntites();
		let author = plb.getElementsByClassName('product_authors')[0].innerHTML.replaceHtmlEntites();
		let description = '';
		let param = plb.getElementsByClassName('product_param')[0].innerHTML.replaceHtmlEntites();
		let term = plb.getElementsByClassName('term')[0].innerHTML.replaceHtmlEntites();
		let p_id = element.getElementsByName('p_id')[0].getAttribute('value');
		var book = {
			title: title,
			author: author,
			description: description,
			param: param,
			term: term,
			price: price,
			p_id: p_id
		}
		console.log(book);
		books.push(book); 
	});
	
	let navs = dom.getElementsByClassName('pagelink_'); 
	var nas = navs.filter(function(el){
		try {
			if (el.nodeName === 'a') {
				return el.getAttribute('title').substr(0,4) === 'Nast'
			} else {
				return false;
			}		
		} catch (e) {
			return false;
		}
	});	
//console.log('navs.lenght',navs.length);		
console.log('nas.lenght',nas.length);	
//console.log("books", books);
    return {
		books: books, 
		ifnext: nas.length
	};
}

String.prototype.replaceHtmlEntites = function() {
    var s = this.trim().replace(/<[^>]*>?/gm, '').replace(/\s\s+/g, ' ');
    var translate_re = /&(nbsp|amp|quot|lt|gt|apos);/g;
    var translate = {"nbsp": " ","amp" : "&","quot": "\"","lt"  : "<","gt"  : ">", "apos": "\""};
    return ( s.replace(translate_re, function(match, entity) {
      return translate[entity];
    }) );
};



    // listBox.forEach(element => {
	// 	let title = element.getElementsByTagName('a')[0].innerHTML.replaceHtmlEntites();
	// 	let author = element.getElementsByClassName('product_authors')[0].innerHTML.replaceHtmlEntites();
	// 	let description = '';
	// 	//try {
	// 	//   description = element.getElementsByClassName('product_short_description')[0].innerHTML.replaceHtmlEntites();
	// 	//} catch (e) {}
	// 	let param = element.getElementsByClassName('product_param')[0].innerHTML.replaceHtmlEntites();
	// 	let term = element.getElementsByClassName('term')[0].innerHTML.replaceHtmlEntites();
	// 	output.push({
	// 		title: title,
	// 		author: author,
	// 		description: description,
	// 		param: param,
	// 		term: term
	// 	});    
	// });  