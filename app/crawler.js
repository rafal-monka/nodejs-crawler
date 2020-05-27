var axios = require('axios');
var DomParser = require('dom-parser');
const storage = require("./storage.js");
const sT = require("../config/global.js");
const CONST_PAGE_SIZE = 1000;

exports.run = async (force=false)=> {
	sT.currentScan = 0;
	//add name of category
	sT.scanTables.forEach((t, index) => {
		sT.scanTables[index].catname = sT.getCategoryName(t.category);
	})	
	perform(force, CONST_PAGE_SIZE, 1); 
}

exports.runCount = async ()=> {
	sT.currentScan = 0;
	//add name of category
	sT.scanTables.forEach((t, index) => {
		sT.scanTables[index].catname = sT.getCategoryName(t.category);
	})
	//console.log(sT.scanTables);
	performCount(2);
}

perform = async (force, pageSize, page) => {
	console.log('perform SCAN', sT.currentScan, 'of', sT.scanTables.length, 'force', force, 'pageSize', pageSize);
	if (sT.currentScan >= sT.scanTables.length) {
		console.log('END OF PROCESSING');
		return;		
	}

	if (force===false) {
		sT.scanTables[sT.currentScan].lang = 'XXX';
	}

	var v = sT.scanTables[sT.currentScan];
	console.log('scan params', JSON.stringify(v));

	console.log('page', page);
	let cs = sT.scanTables[sT.currentScan];
	if (cs.count !== null) {
		let count = cs.count.replace('wyszukanych pozycji: ','');
		console.log('progress', Math.round( 100 * cs.done / count * 100)/100, '%' );
	}
	await getList(pageSize, v.lang, v.category, v.price_from, v.price_to, page)
        .then(response => {
			//console.log("response.data", response.data);
			let result = parsePage(response.data);	
			console.log('result.books.length',result.books.length);
			result.books.forEach(book => {
				//console.log('book.title',book.title);  
				book.category = v.category; 
				book.lang = v.lang;
				storage.storeBook(book);
				sT.scanTables[sT.currentScan].done++;
			});

			//move to next page of results
			if (result.ifnext === 1) {
				perform(force, pageSize, page+1);
			//move to next scan 
			} else {
				console.log('GO NEXT SCAN ARRAY');
				sT.currentScan++;
				perform(force, pageSize, 1); 
			}
		})
		.catch(error => {
			console.log('ERROR', error);
			//res.status(404).send('Not found');
		})
}

performCount = async (pageSize) => {
	if (sT.currentScan >= sT.scanTables.length) {
		console.log('END OF PROCESSING');
		return;		
	}

	var v = sT.scanTables[sT.currentScan];
	console.log('performCount', sT.currentScan, pageSize, v.lang, v.category, v.price_from, v.price_to);
	await getList(pageSize, v.lang, v.category, v.price_from, v.price_to, 1)
        .then(response => {
			//console.log("response.data", response.data);
			let result = parseCount(response.data);	
			if (result !== null) console.log(JSON.stringify(result));
			sT.currentScan++;
			performCount(pageSize);
		})
		.catch(error => {
			console.log('ERROR', error);
		})

}

getList = (pageSize, lang, category, price_from, price_to, page) => {
    //const CONST_URL = "https://krainaksiazek.pl/sklep.html?author=&keyword=&isbn13=&publisher=&bisac=&action=search&type=adv&md=products_searcher";
	const CONST_URL = "https://krainaksiazek.pl/sklep.html?md=products_searcher&action=search&filter_hon=1&type=adv&q_sort=0&filter_clear=";
	try {
        return axios({
            url: CONST_URL,
            methog: 'get',
            params: {
				pages_nr_sort: pageSize, //page size
				perm: 2, //w regularnej sprzedaży 
				p_lang: lang,
				p_price_from: price_from,
				p_price_to: price_to,
				pg: page/*,
				ct_id: category*/
            }
        })
    } catch (error) {
        console.log('###Error: getList');
        console.error(error);
    }
}

parseCount = (html) => {  
	//console.log('parseCount');
	var parser = new DomParser();
	var dom = parser.parseFromString(html);
	try {
		let count = dom.getElementById('searcher_flt').getElementsByTagName('span')[0].innerHTML.replaceHtmlEntites();
		sT.scanTables[sT.currentScan].count = count;
		return sT.scanTables[sT.currentScan];
	} catch (e) {
		console.log('parseCount - no results');
		return null;
	}
}

parsePage = (html) => {    
//console.log('parsePage');
    var parser = new DomParser();
    var dom = parser.parseFromString(html);
	let books = [];
	let mainNode;
	try {
		let count = dom.getElementById('searcher_flt').getElementsByTagName('span')[0].innerHTML.replaceHtmlEntites();
		sT.scanTables[sT.currentScan].count = count;
    	mainNode = dom.getElementsByClassName('category_products')[0].childNodes[0];
	} catch (e) {
		console.log('parsePage - no results');
		return {
			books: [], 
			ifnext: 0
		};
	}

	let tables = mainNode.getElementsByTagName('table');
	//console.log('tables.length', tables.length);

	tables.forEach(element => {
		let plb = element.getElementsByClassName('product_list_box')[0];
		let title = plb.getElementsByTagName('a')[0].innerHTML.replaceHtmlEntites();
		try {		
			let price = element.getElementsByClassName('product_price_with_tax_list')[0].innerHTML.replaceHtmlEntites();
			let title = plb.getElementsByTagName('a')[0].innerHTML.replaceHtmlEntites();
			let author = plb.getElementsByClassName('product_authors')[0].innerHTML.replaceHtmlEntites();
			let description = '';
			try {
				description = element.getElementsByClassName('product_short_description')[0].innerHTML.replaceHtmlEntites();
			} catch (e) {
				description = '';
			}
			let param = plb.getElementsByClassName('product_param')[0].innerHTML.replaceHtmlEntites();
			let term = plb.getElementsByClassName('term')[0].innerHTML.replaceHtmlEntites();
			let p_id = element.getElementsByName('p_id')[0].getAttribute('value');
			var book = {
				title: title,
				author: author,
				description: description.substr(0,500),
				param: param,
				term: term,
				price: price,
				p_id: p_id
			}
	//console.log(book);
			books.push(book);
		} catch (e) {
			console.log('Error ', title);
		}
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
//console.log('nas.lenght',nas.length);	
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