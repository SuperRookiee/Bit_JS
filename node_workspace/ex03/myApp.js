//Express 기본 모듈 불러오기
let express = require('express'), http = require('http'), path=require('path')
//Express의 미들웨어 불러오기
let bodyParser = require('body-parser'), cookieParser = require('cookie-parser'), static = require('serve-static'), errorHandler = require('errorhandler')
//오류 핸들러 모듈 사용
let expressErrorHandler = require('express-error-handler')
//Session 미들웨어 불러오기
let expressSession = require('express-session')
//익스프레스 객체 생성
let app = express();

//몽고디비 모듈 사용
let MongoClient = require('mongodb').MongoClient
//데이터베이스 객체를 위한 변수 선언
let database
//데이터베이스에 연결
function connectDB() {
    //데이터베이스 연결 정보
    let databaseUrl = 'mongodb://localhost:27017/'
    //데이터베이스 연결
    MongoClient.connect(databaseUrl, function (err,client) {
        database = client.db('bitDB')
        if(err) throw err
        console.log('데이터베이스에 연결되었습니다.:'+databaseUrl)
    })
}

//기본 속성 설정
app.set('port', process.env.PORT || 3000)
//body-parser를 이용해 application/x-www-orm-urlencoded 파싱
app.use(bodyParser.urlencoded({extended: false}))
//body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())
//public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname,'public')))


//사용자를 인증하는 함수
var authMember = function (database, userId, userPwd, callback) {
    console.log("authMember 호출됨:"+ userId+','+userPwd)
    //Members 컬렉션 참조
    var members = database.collection('Members')
    members.find({"userId":userId, "userPwd" : userPwd}).toArray(function (err, docs) {
        if(err){
            //오류 발생 시 콜백 함수를 호출하면서 에러 객체 전달
            callback(err,null)
            return
        }
        if(docs.length > 0){
            //조회한 레코드가 있는 경우 콜백 함수를 호출하면서 조회 결과 전달
            console.log("아이디[%s], 패스워드[%s]가 일치하는 사용자 찾음.", userId,userPwd)
            callback(null,docs)
        }
        else{
            //조회한 레코드가 없는 경우 콜백 함수를 호출하면서 null, null 전달
            console.log("일치하는 사용자를 찾지 못함")
            callback(null,null)
        }
    })
}

//회원 가입을 위한 함수
var addMember = function (database, userId, userPwd, callback) {
    console.log("addMember 호출됨:"+ userId+','+userPwd)
    //Members 컬렉션 참조
    var members = database.collection('Members')
    members.insertMany([{"userId": userId, "userPwd" : userPwd}],function (err, result) {
        if(err){
            //오류 발생 시 콜백 함수를 호출하면서 오류 객체 전달
            callback(err,null)
            return
        }
        if(result.modifiedCount > 0){
            console.log("사용자 레코드 추가됨 :", result.insertedCount)
        }
        else{
            console.log("추가되지 않았음")
        }
        callback(null,result)
    })
}

//회원 수정을 위한 함수
var updateMember = function (database, userId, userPwd, callback) {
    console.log("updateMember 호출됨:"+ userId+','+userPwd)
    //Members 컬렉션 참조
    var members = database.collection('Members')
    members.updateOne({"userId": userId}, { $set:{"userPwd" : userPwd} } ,function (err, result) {
        if(err){
            //오류 발생 시 콜백 함수를 호출하면서 오류 객체 전달
            callback(err,null)
            return
        }
        if(result.modifiedCount > 0){
            console.log("사용자 레코드 추가됨 :", result.modifiedCount)
        }
        else{
            console.log("추가되지 않았음")
        }
        callback(null,result)
    })
}



//============라우팅 함수 등록 ==================//
var router = express.Router();
//로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/process/login').post(function (req, res) {
    console.log('/process/login')
    //요청 파라미터 확인
    var userId = req.body.userId || req.query.userId
    var userPwd = req.body.userPwd || req.query.userPwd
    console.log('요청 파라미터 : '+ userId + ',' + userPwd)
    //데이터베이스 객체가 최기화된 경우, authMember 함수 호출하여 사용자 인증
    if(database){
        authMember(database, userId, userPwd, function (err, docs) {
            if(err) {throw err}
            //조회된 레코드가 있으면 성공 응답 전송
            if(docs){
                res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
                res.write('<h1>로그인 성공</h1>')
                res.end()
            }
            else{
                //조회된 레코드가 없는 경우 실패 응답 전송
                res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
                res.write('<h1>로그인 실패</h1>')
                res.end()
            }
        })
    }
    else{
        res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
        res.write('<h1>데이터베이스 연결 실패</h1>')
        res.end()
    }
})

//회원가입 라우팅 함수
router.route('/process/addMember').post(function (req, res) {
    console.log('/process/addMember 호출됨')
    //요청 파라미터 확인
    var userId = req.body.userId || req.query.userId
    var userPwd = req.body.userPwd || req.query.userPwd
    console.log('요청 파라미터 : '+ userId + ',' + userPwd)
    //데이터베이스 객체가 최기화된 경우, authMember 함수 호출하여 사용자 인증
    if(database){
        addMember(database, userId, userPwd, function (err, result) {
            if(err) {throw err}
            //추가된 데이터가 있으면 성공 응답 전송
            if(result && result.insertedCount > 0){
                console.dir(result)
                res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
                res.write('<h1>가입 성공</h1>')
                res.end()
            }
            else{   //결과 객체가 없으면 실패 응답 전송
                res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
                res.write('<h1>가입 실패</h1>')
                res.end()
            }
        })
    }
    else{
        res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
        res.write('<h1>데이터베이스 연결 실패</h1>')
        res.end()
    }
})

//회원수정 라우팅 함수
router.route('/process/updateMember').post(function (req, res) {
    console.log('/process/updateMember 호출됨')
    //요청 파라미터 확인
    var userId = req.body.userId || req.query.userId
    var userPwd = req.body.userPwd || req.query.userPwd
    console.log('요청 파라미터 : '+ userId + ',' + userPwd)
    //데이터베이스 객체가 최기화된 경우, authMember 함수 호출하여 사용자 인증
    if(database){
        updateMember(database, userId, userPwd, function (err, result) {
            if(err) {throw err}
            //수정된 데이터가 있으면 성공 응답 전송
            if(result && result.modifiedCount > 0){
                console.dir(result)
                res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
                res.write('<h1>회원 정보 수정 성공</h1>')
                res.end()
            }
            else{   //결과 객체가 없으면 실패 응답 전송
                res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
                res.write('<h1>회원 정보 수정 실패</h1>')
                res.end()
            }
        })
    }
    else{
        res.writeHead('200',{'Content-Type': 'text/html;charset=utf8'})
        res.write('<h1>데이터베이스 연결 실패</h1>')
        res.end()
    }
})


app.use('/', router);

app.listen(app.get('port'), function () {
    console.log('서버가 시작되었습니다.포트:' + app.get('port'))
    //데이터베이스 연결을 위한 함수 호출
    connectDB();
})
