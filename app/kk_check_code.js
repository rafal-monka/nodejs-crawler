
var axios = require('axios');
const utils = require('./utils');
var Launcher = require("./launcher.js");
const dbConfig = require("../config/db-config");
const db = require("./models");
const kk_codes = db.kk_codes;

exports.scan = () => {
    let codesArr = [
        'myb-94964ed675'        
    ]

    for (let i=0x0; i<0xFF; i++) {
        let str = new Array(10).concat([i]).join('0').slice(-10);
        codesArr.push('myb-'+str);
    }

    let pad = new Launcher(
        20, 
        codesArr,
        //callFunction,
        checkCode,
        //callbackFunction,
        (item, res) => {
            //console.log(item, res.data);
            let output = utils.replaceHtmlEntites(res.data);
            let code = {
                code: item,
                msg: output
            }
            kk_codes.create(code);
            return output;
        },
        //finalCallBack
        (param) => {
            console.log(param) 
        }
    )
    pad.run();

    // checkCode(code).then(response => {
    //     //console.log("response.data", response.data);
    //     let result = response.data;	
    //     console.log(code, utils.replaceHtmlEntites(result));
    // })
    // .catch(error => {
    //     console.log('ERROR', error);
    // })
}

checkCode = (code) => {
    console.log('code', code);
	const CONST_URL = "https://krainaksiazek.pl/js/ax_check_coupons.php";
	try {
        const params = new URLSearchParams();
        params.append('coupon_code_val', 300);
        params.append('coupon_code_val2', '76904.ea429365cb93ac80a5ff7d5b248f662e');
        params.append('coupon_code', code);
        return axios.post(
            CONST_URL,
            params
        )
    } catch (error) {
        console.log('###Error: checkCode');
        console.error(error);
    }
}
