module.exports = class Launcher  {

    constructor(max_parralel, items, callFunction, callbackFunction, catchFunction, finalCallbackFunction) {
        this.max_parralel = max_parralel
        this.status = 'INIT'
        this.lastLaunchItem = 0
        this.runningCount = 0
        this.leftItems = items.length
        this.items = items
        this.output = []
        this.callFunction = callFunction
        this.callbackFunction = callbackFunction
        this.catchFunction = catchFunction
        this.finalCallbackFunction = finalCallbackFunction
    }

    run () {
        console.log('run', Math.min(this.max_parralel, this.items.length));
        if (this.items) {
            this.status = 'RUNNING';
            for (var i=0; i < Math.min(this.max_parralel, this.items.length); i++ ) {
                setTimeout( ()=> {
                    //console.log('for launchItem', i);
                    this.launchItem()
                }, 100)
            }  
        } else {
            console.log('End. Array of items is empty');
        }
    }

    checkQueue() {
        //console.log('checkQueue (lastLaunchItem, items.length, runningCount, leftItems)=', this.lastLaunchItem, this.items.length, this.runningCount, this.leftItems)
        //check queue
        // if (this.runningCount > 0 || (this.runningCount === 0 && this.max_parralel === 1)) {
        //     this.launchItem()
        // } else {

        if (this.leftItems === 0) {
            //console.log('done', this.lastLaunchItem);
            this.status = 'DONE';
            this.finalCallbackFunction(this.output);    
        } else {
            if (this.runningCount <= this.max_parralel) this.launchItem()
        }
    }

    launchItem () {        
        if (this.lastLaunchItem < this.items.length) {
            console.log('launchItem() ', this.lastLaunchItem, ' of ', this.items.length-1)
            this.runningCount++
            let item = this.items[this.lastLaunchItem++]
            //console.log('launched item', item)
            try {
                this.callFunction(item)
                .then(value => {
                    // fulfillment
                    //console.log(value.data);
                    this.runningCount--
                    this.leftItems--
                    let val = null
                    try {
                        val = this.callbackFunction(item, value)
                    } catch (e) {
                        console.error(e)
                        console.log(item)
                        val = e.toString()
                    }
                    this.output.push( {
                        item: item, 
                        output: val
                    });
                    this.checkQueue()
                })
                .catch(e => {
                    // rejection
                    console.log('launchItem(): THEN CATCH. Item ', item, ' [REJECTED]. Error', e.toString())
                    this.catchFunction(e, item)
                    this.runningCount--
                    this.leftItems--
                    this.checkQueue()
                })
            } catch (e) {
                console.log('launchItem(): TRY CATCH. callFunction ',item, ' Error', e.toString())
                setTimeout( () => {
                    this.runningCount--
                    this.leftItems--
                    this.checkQueue()
                    //this.catchFunction(e, item) ###???
                }, 3000)
            }
        } 
    }
}


//-------------------
exports.runTest = ()=> {
    //performCrawl('drawings','main_ac.htm'); 
    let pad = new Launcher(
        3, 
        [
            {id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'}, {id: 4, name: 'd'}, 
            {id: 5, name: 'e'}, {id: 6, name: 'f'}, {id: 7, name: 'g'}, {id: 8, name: 'h'} 
        ], 
        //callFunction,
        (param) => {
            return new Promise((resolve, reject) => {
                console.log('callFunction', param);
                resolve({resolve_value: param});
            })
        },
        //callbackFunction,
        (param) => {
            console.log('callbackFunction', param);
            return {callback_value: JSON.stringify(param)}
        },
        //finalCallBack
        (param) => {
            console.log('finalCallBack', param);
        } 
    );
    pad.run();
}
