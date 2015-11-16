/*!
* Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
* Help document：https://github.com/linkFly6/so/blob/master/So/Other/Sogou/Promise.md
* Date: 2015-11-13 16:11:13
* ECMAScript 5(2015)规范Promise对象 - polyfill Promise
*/
(function (global, factory) {
    //UMD处理
    if (typeof define === "function" && define.amd) {
        //AMD
        define(['util'], function (_) {
            return factory(global, _);
        });
    } else if (typeof module === "object" && typeof module.exports === "object") {
        //node/commonJs
        module.exports = factory(global, require('util'), true);
    } else {
        //browser
        factory(global, global._);
    }
})(typeof window !== 'undefined' ? window : this, function (window, _, noGlobal) {
    'use strict';
    if (noGlobal !== true) {
        window.sogou = window.sogou || {};
        window.sogou.Promise = Promise;
    }
    //if (_.isFunction(window.Promise)) return window.Promise;
    var bind = Function.prototype.bind,
        ON_FUlFILLED = '[[OnFulfilled]]',
        ON_REJECTED = '[[OnRejected]]',
        CHAIN = '[[Chain]]',
        STATUS = {
            PENDING: 2,
            DONE: 1,
            FAIL: 0,
            ERROR: 3
        },
        GUID = 0;

    function Promise(callback) {
        if (!(this instanceof Promise)) throw new TypeError("Constructor Promise requires 'new'");
        if (!_.isFunction(callback)) throw new TypeError('Not enough arguments to Promise.');
        this._status = STATUS.PENDING;
        this._id = GUID++;
        this._isover = false;
        var $this = this;
        //callback的this指向window
        try {
            callback(function (data) {
                $this._data = data;
                doCallback($this, $this._status = STATUS.DONE, data);
            }, function (data) {
                $this._data = data;
                doCallback($this, $this._status = STATUS.FAIL, data);
            });
        } catch (e) {
            $this._data = e;
            doCallback($this, $this._status = STATUS.ERROR, e);
        }
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
        var $this = this;
        $this[ON_FUlFILLED] = onFulfilled;
        $this[ON_REJECTED] = onRejected;
        return new Promise(function (resolve, reject) {
            //这里怎么处理？
            doCallback($this, $this._status, $this._data, function (data) {
                this._status === STATUS.DONE ? resolve(data) : reject(data);
            });
        });
    };

    Promise.prototype['catch'] = function (func) {
        return this.then(null, func);
    };

    function doCallback(promise, status, data, callback) {
        if (promise[CHAIN] && !callback) {
            callback = promise[CHAIN];
        }
        if (promise._isover) {
            if (_.isFunction(callback))
                callback.call(promise, data);
            return;
        };
        if (status === STATUS.PENDING || (!promise[ON_FUlFILLED]) && !promise[ON_REJECTED]) {
            promise[CHAIN] = callback;
            return;
        };
        var func = status === STATUS.DONE ? resolve : reject;
        _.nextTick(function () {
            try {
                nextTickCallback(promise, func, data, status, callback)
            } catch (e) {
                //catch处理
                promise._status = STATUS.ERROR;
                promise._data = e;
                _.isFunction(callback) && callback.call(promise, e);
            }
        });
    }

    function nextTickCallback(promise, func, data, status, callback) {
        if (promise._isover) return;
        promise._status = status;
        var res = func(promise, data);
        if (res instanceof Promise) {
            res.then(function (value) {
                _.isFunction(callback) && callback.call(res, value);
            }, function (value) {
                _.isFunction(callback) && callback.call(res, value);
            });
        } else if (_.isFunction(callback))
            callback.call(promise, res);
    };

    function resolve(promise, data) {
        //promise只支持一个参数
        var res;
        if (_.isFunction(promise[ON_FUlFILLED])) {
            res = promise[ON_FUlFILLED](data);
            promise._isover = true;
        }
        return res;
    };

    function reject(promise, data) {
        var res;
        if (_.isFunction(promise[ON_REJECTED])) {
            //promise._status = STATUS.FAIL;
            res = promise[ON_REJECTED](data);
            promise._isover = true;
        } else {
            res = data;
            promise._isover = true;
        }
        return res;
    };

});
