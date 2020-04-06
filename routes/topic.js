const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template.js');

//-----------------------
// CRUD
//-----------------------

router.get('/create',function (request, response) {
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

router.post('/create_process',function (request, response) {
    let post = request.body;
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, {Location: `/topic/${title}`});
        response.end();
    })
});   // 파일 생성 실행 부분

router.get('/update/:pageId',function (request, response) {
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

router.post('/update_process',function (request, response) {
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

router.post('/delete_process', function (request, response) {
    let post = request.body;
    let id = post.id;
    let filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
        response.redirect('/');
    })
});  // 파일 삭제 부분

router.get('/:pageId', function (request, response, next) {
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

module.exports = router;
