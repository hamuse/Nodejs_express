const express = require('express');
const router = express.Router();
const template = require('../lib/template.js');

//-----------------------
// 메인
//-----------------------

router.get('/', function (request, response) {
    let title = 'Welcome';
    let description = 'Hello, Node.js';
    let list = template.list(request.list);
    let html = template.html(title, list,
        `<h2>${title}</h2>${description}
            <img src="/images/babyTiger.jpeg" style="width:300px; display: block; margin:10px;">`,
        `<a href="/topic/create">create</a>`
    );
    response.send(html);
});                       // 메인 페이지

module.exports = router;

