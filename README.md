# deferJsonp ![license|MIT][1]


Promise-polyfill兼容库[**Promise.js**][2]��

## 异步控制
过去的代码
```javascript
    window.demo1 = function (data) {//jsonp�����ص�����
        window.demo2 = function (data2) {
            window.demo3 = function (data3) {
                console.log(data, data2, data3);
            };
            writeJsonp('/test?callback=demo3')
        };
        writeJsonp('/test?callback=demo2');
    };
    writeJsonp('/test?callback=demo1');//����jsonp����
```

现在的代码
```javascript
    var defer = new deferJsonp,
        callback = function (data) { return data; };
    defer.load('/test?callback=demo1',callback)
         .load('/test?callback=demo2',callback)
         .load('/test?callback=demo3', function (data3, data2, data) {
				console.log(data, data2, data3);
         });
```
   

&nbsp;&nbsp;

----------

&nbsp;&nbsp;

遵循Promise原生API的实现

 - 遵循Promise/A+规范

![jsonp][3]
  


&nbsp;&nbsp;

特性
 - 优雅精湛的实现Promise
 - 覆盖原生Promise 90% API特性
  

  &nbsp;&nbsp;

## API
### deferJsonp.prototype.then(done[,fail])
>挂起promise回调函数

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



## 更多API
更多Promise相关API如下：

 1. deferJsonp.prototype.all(promises) - 处理多个API 
 
 
## 更新日志

**2015-11-16**
> 
 - 创建了Promise

  
  
 
## License

    The MIT License (MIT)

    Copyright (c) 2004 Kohsuke Kawaguchi, Sun Microsystems Inc., and a number of other contributors. 

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


  [1]: https://camo.githubusercontent.com/11b46a2fb2858bbfcaf16cd73aa05f851230d0f5/687474703a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d79656c6c6f77677265656e2e737667
  [2]: https://github.com/linkFly6/deferJsonp/blob/master/src/deferJsonp.js
  [3]: https://github.com/linkFly6/deferJsonp/blob/master/external/jsonp.gif
  [4]: https://github.com/linkFly6/deferJsonp/blob/master/external/deferJsonp.gif
  [5]: #%E5%BB%B6%E4%BC%B8
  [6]: https://github.com/linkFly6/deferJsonp/tree/master/doc