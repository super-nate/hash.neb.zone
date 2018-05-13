"use strict";

var Whisper = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.content = obj.content;
		this.address = obj.address;
        this.time = obj.time;
        this.index = obj.index;
	} else {
        this.content = "";
        this.address = "";
        this.time = "";
        this.index = "";
	}

};

Whisper.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var FederationService = function () {
    LocalContractStorage.defineMapProperty(this, "whispers", {
        parse: function (text) {
            return new Whisper(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "creator");
};

FederationService.prototype = {
    init: function () {
        // save the creator
        var from = Blockchain.transaction.from;
        this.creator = from;
        this.size = 0;
    },

    save: function (content) {
        content = content.trim();
        if (content === ""){
            throw new Error("empty content");
        }

        var whisper  = new Whisper();
        var from = Blockchain.transaction.from;

        whisper.content = content;
        whisper.address = from;
        whisper.time = new Date();
        whisper.index = this.size;
        var result = this.whispers.put(this.size, whisper);
        this.size++;
        return result;
    },

    get: function (page, num) {
        page = page.trim();
        num = num.trim();
        var start;
        var i=0;
        if (page === "" || num === "") {
            start = this.size;
            if (num === "") {
                num = this.size;
            }

        } else {
            start = this.size - (page-1) * num;
        }

        var results = [];
        for (;i<num; start--,i++ ){
            var result = this.whispers.get(start);
            if (result == null) {
                continue; //the element of the index might be deleted
            }
            results.push(result)
        }
        return results;
    },

    del: function (index) {
        index = index.trim();
        if ( index === "" ) {
            throw new Error("empty content")
        }

        var whisper = this.whispers.get(index);
        if ( whisper.address === Blockchain.transaction.from || this.creator=== Blockchain.transaction.from ) {
            this.whispers.del(index);
        }
        else {
            throw new Error("you can not delete the whisper")
        }
    },

    //in case of someone sends nas to tht contract
    takeout: function (value) {
        var amount = new BigNumber(value);
        //var from = Blockchain.transaction.from;
        var creator = this.creator;
        var result = Blockchain.transfer(creator, amount);
        return result;
    }


};
module.exports = FederationService;