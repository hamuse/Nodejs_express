const express = require('express');
const app = express();
const fs = require('fs');

const qs = require('querystring');
const bodyParser = require('body-parser');
const compression = require('compression');
const indexRouter = require('./routes/index');
const topicRouter = require('./routes/topic');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.get('*', function (request, response, next) {
     fs.readdir('./data',function (error, filelist) {
            request.list = filelist;
            next();
      });
});                  // 파일 리스트 미들웨어

app.use('/', indexRouter);
app.use('/topic', topicRouter);


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