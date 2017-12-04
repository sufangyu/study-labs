`urlQuery.parse([url])` 

格式化 URL 地址的 search，返回格式化后的对象。例如：

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.parse(url));  // 输出: {category: "unset", action: "like", src: "web"}
```



`urlQuery.get(key)` 

获取 URL 地址 search 值中某个查询参数的值。例如:

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.get('src', url));  // 输出: "web"
```



`urlQuery.set(obj, [url])` 

设置 URL 地址 search 值的参数的值， 返回新的 URL 字符串。 例如：

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.set({'src': 'h5', 'isNew': 'true'}, url));  // 输出: "https://www.baidu.com/?category=unset&action=like&src=h5&isNew=true#top"
```



`urlQuery.remove(key, [url])` 

删除 URL 地址 search 值中某个查询参数，返回新的 URL 字符串。例如：

```js
var url = 'https://www.baidu.com?category=unset&action=like&src=web#top';
console.log(urlQuery.remove('src', url));  // 输出: "https://www.baidu.com/?category=unset&action=like#top"
```







```js
var search = 'https://www.baidu.com?uid=585a20941b69e6006cb850a9&suid=3IMzNniemv76RuBBZ7FQ&category=unset&action=like&objectType=entry&value=5a1e561ff265da432e5bc464&src=web#top';
  var hash = '#top';

  console.log(search + '=>>', urlQuery.parse(search));
  console.log(hash + '=>>', urlQuery.parse(hash));

  console.log('--- remove ---');
  console.log(search + '=>>', urlQuery.remove('category', search));
  console.log(hash + '=>>', urlQuery.remove('category', hash));

  console.log('--- set ---');
  console.log(search + '=>>', urlQuery.set({'category': '13128', 'src': 'h5'}, search));
  console.log(hash + '=>>', urlQuery.set({'category': '13128', isBindPhone: false}, hash));

  console.log(urlQuery.get('src'));
```