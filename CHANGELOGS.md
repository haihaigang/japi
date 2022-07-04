# 2015-08-27
1. 自动更新版本，每次提交比较md5签名是否相同，不同则就是一个新版本
2. 接口列表添加快速编辑功能

# 2015-08-20
1. 接口指定是否分页，返回数据类型之名是否数组
2. 如果响应字段时object或array需要更详细字段
```
约定json字符串
{
	"key":"type description",
	"key":"type description",
	"key":{
		"key":"type description",
		"key":"type description"
	},
	"key":[{
		"key":"type description",
		"key":"type description"
	}]
}
```

# 2015-08-10

1. 添加接口、记录最后一次选择的项目
2. 接口排序，按照模块名称排序
3. 添加接口响应字段时，增加快速选择
4. 接口添加复制功能

# 2015-07-17

编写此项目的目的：

1. 能代替接口的文档形式
2. 能与postman插件互相转换