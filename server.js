const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use('/public', express.static('public')) // 나는 스태틱파일을 쓸거다.
const methodOverride = require('method-override') // 메소드오버라이드를 사용할거다
app.use(methodOverride('_method'))

const MongoClient = require('mongodb').MongoClient

let db

MongoClient.connect(
  'mongodb+srv://admin:1234@cluster0.75koc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  function (에러, client) {
    if (에러) return console.log(에러)
    db = client.db('todoapp')

    app.listen(8081, function () {
      console.log('listen on 8081')
    })
  }
)

app.get('/', function (req, 응답) {
  응답.render('index.ejs')
})

app.get('/write', function (req, 응답) {
  응답.render('write.ejs')
})

app.post('/add', function (req, 응답) {
  응답.send('전송완료')
  db.collection('counter').findOne(
    //디비에파일하나만찾고싶을떄
    { name: '게시물갯수' },
    function (에러, 결과) {
      let 총게시물갯수 = 결과.totalPost

      db.collection('post').insertOne(
        { _id: 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date },
        function (에러, 결과) {
          console.log('저장완료')

          db.collection('counter').updateOne(
            { name: '게시물갯수' },
            { $inc: { totalPost: 1 } },
            //오퍼레이터(연산자)
            function (에러, 결과) {
              if (에러) {
                return console.log(에러)
              }
            }
          )
        }
      )
    }
  )
})

app.get('/list', function (req, 응답) {
  //모든데이터 가져오기.
  db.collection('post')
    .find()
    .toArray(function (에러, 결과) {
      console.log(결과)
      응답.render('list.ejs', { posts: 결과 })
    })
})
// 일어나서할부분
app.delete('/delete', function (요청, 응답) {
  요청.body._id = parseInt(요청.body._id) //스트링을 인트로 바까준다.
  db.collection('post').deleteOne(요청.body, function (에러, 결과) {
    console.log('삭제완료')
    응답.status(200).send({ message: '성공' })
  })
})

app.get('/detail/:id', function (요청, 응답) {
  db.collection('post').findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      응답.render('detail.ejs', { data: 결과 })
    }
  )
})

//여러개 edit페이지
app.get('/edit/:id', function (요청, 응답) {
  db.collection('post').findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      console.log(결과)
      응답.render('edit.ejs', { post: 결과 })
    }
  )
})

app.put('/edit', function (요청, 응답) {
  db.collection('post').updateOne(
    { _id: parseInt(요청.body.id) },
    { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } },
    function (에러, 결과) {
      console.log('수정완료')
      응답.redirect('/list')
    }
  )
})
