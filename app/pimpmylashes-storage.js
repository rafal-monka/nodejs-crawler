const Pimp = require('./models/pimp-model')

exports.store = (obj) => {
    let pimp = new Pimp(obj)
    pimp.save()
        .then(function (result ){
            console.log('inserted') //result
        })
        .catch(e => {
            console.log('Error in pimp.save()', e)
        })
}

exports.getAll = () => {
    return new Promise(async function(resolve, reject) {
        try {
            //{id: 'https://www.pimpmylashes.pl/sklep/browxenna/browxenna-201-pearl-blond-henna-saszetka/'}
            let records = await (await Pimp.find())//{price: 0.0} .slice(684)
            resolve(records);
        } catch (e) {
            reject('Pimp.getAll. SOMETHING WRONG '+e)
        }
    })
}

exports.update = (id, val) => {
    //console.log('update', id, val)
    Pimp.findOneAndUpdate({_id: id}, {$set: {
            price: val.price, 
            description: val.description,
            description2: val.description2
        }}, (res)=> {
    }) 
}