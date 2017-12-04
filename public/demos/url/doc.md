> urlQuery.parse([url])

格式化 URL 地址的 search，返回格式化后的对象。例如：

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.parse(url));

// 输出: {category: "unset", action: "like", src: "web"}
```



> urlQuery.get(key)

获取 URL 地址 search 值中某个查询参数的值。例如:

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.get('src', url));

// 输出: "web"
```



> urlQuery.set(obj, [url])

设置 URL 地址 search 值的参数的值， 返回新的 URL 字符串。 例如：

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.set({'src': 'h5', 'isNew': 'true'}, url));

// 输出: "https://www.baidu.com/?category=unset&action=like&src=h5&isNew=true#top"
```



> urlQuery.remove(key, [url])

删除 URL 地址 search 值中某个查询参数，返回新的 URL 字符串。例如：

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.remove('src', url));

// 输出: "https://www.baidu.com/?category=unset&action=like#top"
```