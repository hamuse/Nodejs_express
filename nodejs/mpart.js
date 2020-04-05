let M = {
    v:'v',
    f: function () {
        console.log(this.v);
    }
};

 module.exports = M; // M이라는 객체를 외부 js에서 사용할수 있도록 모듈 exports하겠다는 뜻 .


