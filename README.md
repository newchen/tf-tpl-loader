# tf-tpl-loader for webpack

基于ejs-loader 0.3版本, 添加include功能

## html
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <% include meta.html %>

    <title>
        <%= data.title %>
    </title>
</head>

<body>
    <% include header.html %>

    <div class="wrraper">
        <%= data.content %>
    </div>

    <% include footer.html %>

    <script type="text/javascript" src="/vendor/vendor.js"></script>
    <script type="text/javascript" src="/vendor/iePolyfill.js"></script>
</body>

</html>
```

## webpack loader
```javascript
{
    test: /\.html$/, // html模版
    use: [
        {
            loader: 'tf-tpl-loader', 
            options: {
                variable: 'obj', // 模板的变量名称
                escape: 'xxx', 
                interpolate: 'xxx',
                evaluate: 'xxx',

                /* 导出方式, 有: 
                    默认: module.exports = xxx; 
                    es6: export default = xxx; 
                    return: return xxx 
                */
                export: 'return',

                /* 
                include的文件路径: 
                    如果是绝对路径, 路径 = package.json所在路径 + rootPath + include的路径, 
                    如果是相对路径或直接是文件名, 是相对于当前页面的路径
                */
                rootPath: 'xxx'
            }
        }
    ]
}
```
