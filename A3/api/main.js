const express = require('express');
const cors = require('cors');
const router = require("./router.js");
const app = express();
// 跨域
app.use(cors())
// json 解析
app.use(express.json())
// api 路由注册
app.use('/api',router)
// 启动
app.listen(3000,()=>{
    console.log(3000);
});
