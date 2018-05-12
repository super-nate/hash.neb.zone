"use strict";

var Binding = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.username = obj.username;
		this.address = obj.address;
	} else {
        this.username = "";
        this.address = "";
	}

};

Binding.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var FederationService = function () {
    LocalContractStorage.defineMapProperty(this, "bindings", {
        parse: function (text) {
            return new Binding(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

FederationService.prototype = {
    init: function () {
        // save the creator
        var from = Blockchain.transaction.from;
        LocalContractStorage.set("creator", from);
    },

    save: function (username) {

        username = username.trim();
        if (username === ""){
            throw new Error("empty username");
        }


        var from = Blockchain.transaction.from;
        var binding = this.bindings.get(username);
        if (binding){
            throw new Error("username has been occupied");
        }

        binding = new Binding();

        binding.username = username;
        binding.address = from;

        this.bindings.put(username, binding);

        return binding;
    },

    get: function (username) {
        username = username.trim();
        if ( username === "" ) {
            throw new Error("empty username")
        }
        return this.bindings.get(username);
    },

    del: function (username) {
        username = username.trim();
        if ( username === "" ) {
            throw new Error("empty username")
        }

        var binding = this.bindings.get(username);
        if ( binding.address !== Blockchain.transaction.from  ) {
            throw new Error("you can not delete the binding")
        }

        this.bindings.del(username);

    },

    //in case of someone sends nas to tht contract
    takeout: function (value) {
        var amount = new BigNumber(value);
        //var from = Blockchain.transaction.from;
        var creator = LocalContractStorage.get("creator");
        var result = Blockchain.transfer(creator, amount);
        return result;
    }


};
module.exports = FederationService;