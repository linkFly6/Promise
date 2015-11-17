# Promise ![license|MIT](https://camo.githubusercontent.com/11b46a2fb2858bbfcaf16cd73aa05f851230d0f5/687474703a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d79656c6c6f77677265656e2e737667)


Promise-polyfill兼容库[**Promise.js**](https://github.com/linkFly6/Promise/blob/master/src/Promise.js)


##什么是Promise？
Promise 对象用于延迟(deferred) 计算和异步(asynchronous ) 计算.。一个Promise对象代表着一个还未完成，但预期将来会完成的操作。Promise用来传递异步操作的消息。它代表了某个未来才会知道结果的事件（通常是一个异步操作），并且这个事件提供统一的API，可供进一步处理。

Promise 对象是一个返回值的代理，这个返回值在Promise对象创建时未必已知。它允许你为异步操作的成功或失败指定处理方法。 这使得异步方法可以像同步方法那样返回值：异步方法会返回一个包含了原返回值的 Promise 对象来替代原返回值。

Promise对象有以下几种状态:
- pending: 初始状态, 非 fulfilled 或 rejected.
- fulfilled: 成功的操作.
- rejected: 失败的操作.

Promise在JavaScript语言早有实现，饱受三年的争议，最终纳入[ECMAScript 2015（ECMAScript 6）规范](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects)，Promise遵循Promise/A+规范。统一了用法，原生提供了Promise对象。
当前或古老的浏览器环境并不支持Promise，于是我编写了这个polyfill的库，用于兼容当前的浏览器环境。

Promise的经典在于将JavaScript异步编程抹平为同步编程。

更多的Promise API细节请参阅我的文章《[JavaScript异步编程（1）- ECMAScript 6的Promise对象](http://www.cnblogs.com/silin6/p/4288967.html)》（我肯定要把我的文章单独放啦~~）.

更多相关文章：
- [《ECMAScript 6入门 - Promise对象》](http://es6.ruanyifeng.com/#docs/promise)
- [Promise/A+规范](https://promisesaplus.com/)
- [Promise/A+规范（翻译）](http://segmentfault.com/a/1190000002452115)
- [JavaScript Promise启示录](http://segmentfault.com/a/1190000000492290)
- [&#91;译&#93;深入理解Promise五部曲：1. 异步问题](http://segmentfault.com/a/1190000000586666)


## 异步控制
演示加载一张图片
```javascript
        var imgLoad = function (src, success, error) {
            var img = new Image();
            img.onload = function () {
                success('done');
            }
            img.onabort = img.onerror = function () {
                error('fail');
            };
            img.src = src;
        };
        //调用
        imgLoad('foo.jpg',
            function (str) {
                console.log(str, '成功');//=> 'done 成功'
            },
            function (str) {
                console.log(str, '失败');//=> 'fail 失败'
            });
```

Promise实现
```javascript
        var imgLoad = function (src) {
            //返回Promise
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve('done')
                }
                img.onabort = img.onerror = function () {
                    reject('fail');
                };
                img.src = src;
            });
        };
        //调用
        imgLoad('foo.jpg')
            //异步逻辑抹平
            .then(function (str) {
                console.log(str, '成功');//=> 'done 成功'
            }, function (str) {
                console.log(str, '失败');//=> 'fail 失败'
            });
```


或者利用它可以把异步的代码封装的更加扁平化：
```javascript
        //过去的代码：异步回调地狱
        foo.getJSON('/foo?bar=0', function () {
            $.getJSON('/foo?bar=1', function () {
                $.getJSON('/foo?bar=2', function () {
                    $.getJSON('/foo?bar=3', function () {
                        $.getJSON('/foo?bar=4', function () {
                            $.getJSON('/foo?bar=5', function () {
                                $.getJSON('/foo?bar=6', function () {
                                    $.getJSON('/foo?bar=7', function () {
                                        $.getJSON('/foo?bar=8', function () {
                                            $.getJSON('/foo?bar=9', function () {
                                                $.getJSON('/foo?bar=10', function () {
                                                    console.log('done');
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });


        //Promise封装之后
        $.getJSON('/foo?bar=0')
         .getJSON('/foo?bar=1')
         .getJSON('/foo?bar=2')
         .getJSON('/foo?bar=3')
         .getJSON('/foo?bar=4')
         .getJSON('/foo?bar=5')
         .getJSON('/foo?bar=6')
         .getJSON('/foo?bar=7')
         .getJSON('/foo?bar=8')
         .getJSON('/foo?bar=9')
         .getJSON('/foo?bar=10')
         .then(function () {
             console.log('done');
         })
```

&nbsp;&nbsp;

----------

&nbsp;&nbsp;

特性
 - 优雅精湛的实现Promise
 - 覆盖原生Promise 90% API特性和细节
  

  &nbsp;&nbsp;

## API
### Promise(callback) 
> 构造函数（constructor）
文档：[Promise Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### Promise.prototype.then(onFulfilled[, onRejected])
> Promise.prototype.then()方法返回一个Promise。它有两个参数，分别为Promise在 success 和 failure 情况下的回调函数  
文档：[Promise.prototype.then](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)

```javascript
    var defer = new deferJsonp;
    defer.load('/test?callback=demo1', function () {
        return true;//done
    }, function () {
        return false;//fail
    }, 1000)
		.load('/test?callback=demo2', function (data) {
			return 'linkFly';
		})
		.load('/test?callback=demo3', function (data3, data2, data) {
			console.log(data, data2, data3);//[true,'linkFly','data3']
		});
```

### Promise.prototype.catch(onRejected)
> Promise.prototype.catch() 方法只处理Promise被拒绝的情况，并返回一个Promise。该方法的行为和调用Promise.prototype.then(undefined, onRejected)相同。  
文档：[Promise.prototype.catch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)
 
### Promise.all(promises)
> Promise.all(promises) 方法返回一个promise，该promise会在iterable参数内的所有promise都被解决后被解决。  
文档：[Promise.all](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

### Promise.race(promises)
> Promise.race(promises)方法返回一个promise，这个promise在iterable中的任意一个promise被解决或拒绝后，立刻以相同的解决值被解决或以相同的拒绝原因被拒绝。  
文档：[Promise.race](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)

### Promise.resolve(value)
> Promise.resolve(value)方法返回一个以给定值resolve掉的Promise对象。但如果这个值是thenable的（就是说带有then方法）  
返回的promise会“追随”这个thenable的对象，接收它的最终状态（指resolved/rejected/pendding/settled）；否则这个被返回的promise对象会以这个值被fulfilled  
文档：[Promise.resolve](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)

### Promise.reject(value)
> Promise.reject(reason)方法返回一个用reason拒绝的Promise。  
文档：[Promise.reject](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) 



##兼容性

当前仅兼容到支持ECMAScript 5的（现代）浏览器，有需求可以兼容低版本浏览器。

 
## 更新日志

**2015-11-16**
> 
 - 创建了Promise

  
  
 
## License

    The MIT License (MIT)

    Copyright (c) 2015 linkFly, and a number of other contributors. 

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
