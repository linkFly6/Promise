/*!
 * Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 * Help document：https://github.com/linkFly6/so/blob/master/So/Other/Sogou/Promise.md
 * Date: 2015-11-13 16:11:13
 * ECMAScript 5(2015)规范Promise对象 - polyfill Promise
 * 规范：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
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
    //TODO 
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
        //判断Promise对象
        isPromise = function (value) {
            return value && typeof value === 'object' && value.constructor === Promise;
        },
        //判断对象是否具有Promise行为
        likePromise = function (value) {
            return value && typeof value === 'object' && _.isFunction(value.then);
        },
        each = Array.prototype.forEach;
    //DEBUG
    //var GUID = 0;

    /*
     * 通过构造函数创建一个Promise对象
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
     * @param {Function} executor - 带有 resolve 、reject两个参数的函数对象。 第一个参数用在处理执行成功的场景，第二个参数则用在处理执行失败的场景。 一旦我们的操作完成即可调用这些函数。
     * @returns {Promise}
     */
    function Promise(executor) {
        if (!(this instanceof Promise)) throw new TypeError("Constructor Promise requires 'new'");
        if (!_.isFunction(executor)) throw new TypeError('Not enough arguments to Promise.');
        this._status = STATUS.PENDING;
        //this._id = GUID++;//DEBUG
        this._isover = false;
        var $this = this;

        //executor的this指向window
        try {
            executor(function (data) {
                //防止反复执行
                if ($this._status !== STATUS.PENDING) {
                    return;
                }
                $this._data = data;
                doCallback($this, $this._status = STATUS.DONE, data);
            }, function (data) {
                if ($this._status !== STATUS.PENDING && $this._status !== STATUS.ERROR) { //如果是error状态，则传递
                    return;
                }
                $this._data = data;
                doCallback($this, $this._status === STATUS.ERROR ? STATUS.ERROR : STATUS.FAIL, data);

            });
        } catch (e) {
            //$this._isover = true;
            $this._data = e;
            doCallback($this, $this._status = STATUS.ERROR, e);
        }
    };

    /*
     * Promise.prototype.then()方法返回一个Promise。它有两个参数，分别为Promise在 success 和 failure 情况下的回调函数
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
     * @param {Function} onFulfilled - 一个 Function, 当 Promise 为 fulfilled 时调用. 该函数有一个参数, 为成功的返回值.
     * @param {Function} onRejected - 一个 Function, 当 Promise 为 rejected 时调用. 该函数有一个参数, 为失败的原因.
     * @returns {Promise}
     */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        if (!_.isFunction(onFulfilled)) return this;
        var $this = this,
            newPromise;
        $this[ON_FUlFILLED] = onFulfilled;
        $this[ON_REJECTED] = onRejected;
        return newPromise = new Promise(function (resolve, reject) {
            doCallback($this, $this._status, $this._data, function (data) {
                //这里的error状态传递处理方式
                if (this._status === STATUS.ERROR)
                    newPromise._status = this._status; //=> 传递error
                this._status === STATUS.DONE ? resolve(data) : reject(data);
            });
        });
    };

    /*
     * Promise.prototype.catch() 方法只处理Promise被拒绝的情况，并返回一个Promise。该方法的行为和调用Promise.prototype.then(undefined, onRejected)相同。
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
     * @param {Function} onRejected - 当Promise被拒绝时调用的Function。该函数调用时会传入一个参数：拒绝原因。
     * @returns {Promise}
     */
    Promise.prototype['catch'] = function (onRejected) {
        return this.then(null, onRejected);
    };

    /*
     * Promise.all(promises) 方法返回一个promise，该promise会在promises参数内的所有promise都被解决后被解决。
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
     * @param {Array} promises - 一个Array（ES6规定Promise.all方法的参数不一定是数组，但是必须具有iterator接口）。
     * @returns {Promise}
     */
    Promise.all = function (promises) {
        //TODO promises可循环的Error判定（容错处理）
        return new Promise(function (resolve, reject) {
            var res = [];
            each.call(promises, function (item, i) {
                var itemType = typeof item;
                //具有promise行为
                if (itemType === 'object' && _.isFunction(item.then)) {
                    item.then(function (data) {
                        res.push(data);
                        //防止这个promise的长度在循环中产生变动
                        promises.length === res.length && resolve(res);
                    }, function (data) {
                        reject(data);
                    });
                } else
                    res.push(item);
                promises.length === res.length && resolve(res);
            })
        })

    };

    /*
     * Promise.race(promises)方法返回一个promise，这个promise在promises中的任意一个promise被解决或拒绝后，立刻以相同的解决值被解决或以相同的拒绝原因被拒绝。
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race
     * @param {Array} promises -  - 一个Array（ES6规定Promise.race方法的参数不一定是数组，但是必须具有iterator接口）.
     * @returns {Promise}
     */
    Promise.race = function (promises) {
        return new Promise(function (resolve, reject) {
            var i = 0,
                item;
            for (; i < promises.length; i++) {
                item = promise[i];
                if (likePromise(item)) //具有Promise行为
                    item.then(resolve, reject)
                else {
                    //直接完成
                    resolve(item);
                    break;
                }
            }
        });
    };

    /*
     * Promise.resolve(value)方法返回一个以给定值resolve掉的Promise对象。但如果这个值是thenable的（就是说带有then方法）
     * 返回的promise会“追随”这个thenable的对象，接收它的最终状态（指resolved/rejected/pendding/settled）；否则这个被返回的promise对象会以这个值被fulfilled
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
     * @param {Object | Promise} value - 用来resolve待返回的promise对象的参数。既可以是一个Promise对象也可以是一个thenable。
     * @returns {Promise}
     */
    Promise.resolve = function (value) {
        if (isPromise(value)) return value;
        if (likePromise(value)) {
            return new Promise(function (resolve, reject) {
                value.then(resolve, reject);
            });
        }
        return new Promise(function (resolve) {
            resolve(value);
        });
    };

    /*
     * Promise.reject(reason)方法返回一个用reason拒绝的Promise。
     * 静态函数Promise.reject返回一个被拒绝的Promise。使用是Error实例的reason对调试和选择性错误捕捉很有帮助。
     * 文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject
     * @param {Object | Promise} value - Promise被拒绝的原因。
     * @returns {Promise}
     */
    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };


    //回调中心处理
    function doCallback(promise, status, data, callback) {
        //挂起异步，让promise其他的代码先执行
        //_.nextTick();
        setTimeout(function () {
            //doCallback有多个入口，当一个任务完成后阻塞住其他任务
            if (promise._isover) {
                if (_.isFunction(callback)) //已完成，有回调函数，直接调用
                    callback.call(promise, data);
                return;
            };
            //有回调链
            if (promise[CHAIN] && !callback) {
                callback = promise[CHAIN];
            }
            if (status === STATUS.PENDING || (!promise[ON_FUlFILLED]) && !promise[ON_REJECTED]) { //状态标志完成、回调函数也已经委托，才可以继续执行，否则被拦截
                if (status === STATUS.ERROR && data) {
                    //没有then链的回调函数，并且有error信息，则抛出（即最后一个then，且木有捕获异常，所以这里直接终止状态）
                    promise._isover = true;
                    throw data;
                }
                //挂起回调链
                promise[CHAIN] = callback;
                return;
            };
            var func = status === STATUS.DONE ? resolve : reject;
            try {
                nextTickCallback(promise, func, data, status, callback)
            } catch (e) {
                //catch处理
                promise._isover = true;
                promise._status = STATUS.ERROR;
                promise._data = e;
                if (_.isFunction(callback))
                    callback.call(promise, e);
            }
        }, 0);
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
            res = promise[ON_REJECTED](data);
            //修正Error状态
            promise._status = STATUS.FAIL;
            promise._isover = true;
        } else {
            res = data;
            promise._isover = true;
        }
        return res;
    };

});