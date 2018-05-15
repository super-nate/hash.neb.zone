"use strict";

var Post = function(text) {
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

Post.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var MarketplaceService = function () {
    LocalContractStorage.defineMapProperty(this, "posts", {
        parse: function (text) {
            return new Post(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "creator");
};

MarketplaceService.prototype = {
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

        var post  = new Post();
        var from = Blockchain.transaction.from;

        post.content = content;
        post.address = from;
        post.time = new Date();
        post.index = this.size;
        var result = this.posts.put(this.size, post);
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
            var result = this.posts.get(start);
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

        var post = this.posts.get(index);
        if ( post.address === Blockchain.transaction.from || this.creator=== Blockchain.transaction.from ) {
            this.posts.del(index);
        }
        else {
            throw new Error("you can not delete the post")
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
module.exports = MarketplaceService;