"use strict";

var Binding = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.filename = obj.filename;
        this.hash = obj.hash;
    } else {
        this.filename = "";
        this.hash = "";
    }

};

Binding.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FileHashService = function () {
    LocalContractStorage.defineMapProperty(this, "bindings", {
        parse: function (text) {
            return new Binding(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

FileHashService.prototype = {
    init: function () {
        // save the creator
        var from = Blockchain.transaction.from;
        LocalContractStorage.set("creator", from);
    },

    save: function (filename, hash) {

        filename = filename.trim();
        hash = hash.trim();
        if (filename === "" || hash === ""){
            throw new Error("empty filename or hash");
        }

        var binding = this.bindings.get(filename);
        if (binding){
            throw new Error("filename has been occupied");
        }

        binding = new Binding();

        binding.filename = filename;
        binding.hash = hash;

        this.bindings.put(filename, binding);

        return binding;
    },

    get: function (filename) {
        filename = filename.trim();
        if ( filename === "" ) {
            throw new Error("empty filename")
        }
        return this.bindings.get(filename);
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
module.exports = FileHashService;