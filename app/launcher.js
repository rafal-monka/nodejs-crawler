module.exports = class Launcher  {
    max_parralel = 3;
    items = [];
    status = 'INIT';
    lastLaunchItem = 0;
    runningCount = 0;
    //runningCount: 0,
    output = [];
    callFunction = () => {};
    callbackFunction = () => {};
    finalCallbackFunction = () => {};

    constructor(max_parralel, items, callFunction, callbackFunction, finalCallbackFunction) {
        this.max_parralel = max_parralel;
        this.items = items; 
        this.callFunction = callFunction; 
        this.callbackFunction = callbackFunction;
        this.finalCallbackFunction = finalCallbackFunction;   
    }

    run () {
        console.log('run');
        if (this.items) {
            this.status = 'RUNNING';
            for (var i=0; i < Math.min(this.max_parralel, this.items.length); i++ ) {
                //console.log('for launchItem', i);
                this.launchItem();
            }  
        } else {
            console.log('End. Array of items is empty');
        }
    }

    launchItem () {        
        console.log('launchItem', this.lastLaunchItem, this.items.length);
        if (this.lastLaunchItem < this.items.length) {
            this.runningCount++;
            let item = this.items[this.lastLaunchItem++];
            this.callFunction(item)
            .then(value => {
                // fulfillment
                //console.log(value.data);
                this.runningCount--;
                let val = null;
                try {
                    val = this.callbackFunction(item, value)
                } catch (e) {
                    console.error(e);
                    console.log(item);
                }
                this.output.push( {
                    item: item, 
                    output: val
                });

                //check queue
                if (this.runningCount > 0) {
                    this.launchItem();
                } else {
                    console.log('done', this.lastLaunchItem);
                    this.status = 'DONE';
                    this.finalCallbackFunction(this.output);    
                }
            })
            .catch(e => {
                // rejection
                this.runningCount--;
                console.log('Item ',this.lastLaunchItem,'rejected. Error', e);
            });
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
