//require() 메소드는 exports 객체를 반환함
// var member1 = require('./member1')
// function showMember(){
//     return member1.getMember().userName+','+member1.group.userName
// }
// console.log('사용자 정보: %s', showMember())


//member2는 오류
// var member2 = require('./member2')
// function showMember(){
//     return member2.getMember().userName+','+member2.group.userName
// }
// console.log('사용자 정보: %s', showMember())


// var member3 = require('./member3')
// function showMember(){
//     return member3.getMember().userName+','+member3.group.userName
// }
// console.log('사용자 정보: %s', showMember())


// var member4 = require('./member4')
// function showMember(){
//     return member4().userName +','+'nogroup'
// }
// console.log('사용자 정보: %s', showMember())


// var printMember = require('./member5').printMember
// printMember()


// var member6 = require('./member6')
// member6.printMember()


const Member = require('./member7')
var Member7 = require('./member7')
var member7 = new Member7('conan', '코난')
member7.printMember()

