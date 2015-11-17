/*!
* Copyright 2015 linkFLy - http://www.cnblogs.com/silin6/
* Released under the BSD license
* http://opensource.org/licenses/BSD-3-Clause
* Help document：https://github.com/linkFly6/so/blob/master/So/Other/Sogou/Service.md
* Date: 2015-7-20 16:16:17
*/
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        //AMD
        define("util", [], function () {
            return factory(global);
        });
    } else if (typeof module === "object" && typeof module.exports === "object") {
        //node/commonJs
        module.exports = factory(global, true);
    } else {
        //browser
        factory(global);
    }
})(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    'use strict';
    var toString = Object.prototype.toString,
        util = {
            isFunction: function (value) {
                return toString.call(value) === '[object Function]';
            },
            isArrayLike: function (obj) {
                if (obj == null) return false;
                var length = obj.length, t = toString.call(obj);
                return t === '[object Array]' || length === 0 || !util.isFunction(obj) &&
                t !== '[object String]' && //解决TypeError：invalid 'in' operand obj，字符串不允许使用in
                (+length === length && //正数
                !(length % 1) && //整数
                (length - 1) in obj); //可以被索引，防止0引发bug
            },
            nextTick: new function () {
                //自动尝试浏览器最优线程执行
                var tickObserver = window.MutationObserver,
                    tickChannel = window.MessageChannel,
                    tickSetImmediate = window.setImmediate;
                //任务队列
                var queue = [];
                function callback() {
                    //TODO 线程并不安全，没有锁线程
                    var n = queue.length;
                    for (var i = 0; i < n; i++) {
                        queue[i]();
                    }
                    queue = queue.slice(n);
                }
                if (tickSetImmediate) {
                    //console.log('nextTick - tickSetImmediate');
                    return function (func) {
                        queue.push(func);
                        window.setImmediate(func);
                        return util;
                    }
                }
                if (tickChannel) {
                    //console.log('nextTick - MessageChannel');
                    tickChannel = new window.MessageChannel();
                    tickChannel.port1.onmessage = function () {
                        callback();
                    };
                    return function (func) {
                        queue.push(func);
                        tickChannel.port2.postMessage(0);
                        return util;
                    }
                }
                if (tickObserver) {
                    //console.log('nextTick - 支持监听DOM树');
                    var node = document.createTextNode("service")
                    new tickObserver(callback).observe(node, { characterData: true })
                    return function (func) {
                        queue.push(func)
                        node.data = Math.random();
                        return util;
                    }
                }
                return function (func) {
                    setTimeout(func, 0);
                    return util;
                }
            }
        };
    if (typeof noGlobal !== true) {
        window._ = util;
    }
    return util;
});

