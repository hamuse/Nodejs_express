const express = require('express');
const app = express();
const fs = require('fs');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const qs = require('querystring');
const bodyParser = require('body-parser');
const compression = require('compression');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.get('*', function (request, response, next) {
     fs.readdir('./data',function (error, filelist) {
            request.list = filelist;
            next();
      });
});                  // 파일 리스트 미들웨어

//-----------------------
// 메인
//-----------------------

app.get('/', function (request, response) {
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

//-----------------------
// CRUD
//-----------------------

app.get('/topic/create',function (request, response) {
    console.log(request.list);
    let title = 'WEB - create';
    let list = template.list(request.list);
    let html = template.html(title, list, `
            <form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>`, '');
    response.send(html);

});            // 파일 생성 선택 부분

app.post('/topic/create_process',function (request, response) {
    let post = request.body;
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, {Location: `/topic/${title}`});
        response.end();
    })
});   // 파일 생성 실행 부분

app.get('/topic/update/:pageId',function (request, response) {
    let filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = request.params.pageId;
        let list = template.list(request.list);
        var html = template.html(title, list,
            `
                     <form action="/topic/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                     </form>`,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`);
        response.send(html);
    });
});    // 파일 수정 선택 부분

app.post('/topic/update_process',function (request, response) {
    let post = request.body;
    let id = post.id;
    let title = post.title;
    let description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.redirect(`/topic/${title}`);
        });
    });
});   // 파일 수정 실행 부분

app.post('/topic/delete_process', function (request, response) {
    let post = request.body;
    let id = post.id;
    let filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
        response.redirect('/');
    })
});  // 파일 삭제 부분

app.get('/topic/:pageId', function (request, response, next) {
    let filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if (err) {

            next(err); // 정상 처리가 안될 경우 err 처리가 되게 하는 부분

        } else {
            let title = request.params.pageId;
            let sanitizedTitle = sanitizeHtml(title);
            let sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
            });
            let list = template.list(request.list);
            let html = template.html(title, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/topic/create">create</a>
                                <a href="/topic/update/${sanitizedTitle}">update</a>
                               <form action="/topic/delete_process" method="post" onsubmit="deleteis">
                               <input type="hidden" name="id" value="${sanitizedTitle}">
                               <input type="submit" value="delete">
                               </form>`);
            response.send(html);
        }
    });

});    // 페이지 선택 부분


// -----------------------
// -----------------------

app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!!');
});                           // 주소를 찾을 수 없을 때 띄우는 에러 메세지  (미들웨어)

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});                      // 에러 핸들러 미들웨어

app.listen(3001, function () {
    console.log('Example app listening on port 3001!')
});