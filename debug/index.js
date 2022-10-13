import { observable, observe, unobserve } from '@nx-js/observer-util'

const data = observable({ array: [1, 2, 3, 4], num: 12, counter: 0 })
const data2 = observable({
  name: 'gaga'
})
let reactions = []

// observe 监听了2个值
// 这里observe 的功能很像react的setState
// 当其中一个state变化时就会重新触发render
// 所以当data.num 和 data.counter 不同时间变化时候
// 下面 callback 会执行2次
observe(() => {
  const result = data.num + data2.name
  console.log('num and counter reaction', result)
})
observe(() => {
  console.log('secongg observe', data.num)
})

setTimeout(() => {
  data2.name = 'gag222'
  data.num = 0
}, 1000)

// observe(() => {
//   console.log('counter reaction...', data.counter)
// })

// data.num = 2

// function observeMany() {
//   for (let i = 0; i < 10000; i++) {
//     const reaction = observe(() => {
//       return data.num + data.array.reduce((sum, num) => sum + num, 0)
//     })
//     reactions.push(reaction)
//   }
// }

// function unobserveMany() {
//   for (let reaction of reactions) {
//     unobserve(reaction)
//   }
//   reactions = []
//   // this makes it not clean up properly!
//   clearInterval(interval)
// }

// window.observeMany = observeMany
// window.unobserveMany = unobserveMany
