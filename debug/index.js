import { observable, observe, unobserve } from '@nx-js/observer-util'

const data = observable({ array: [1, 2, 3, 4], num: 12 })
let reactions = []

const interval = setInterval(() => {
  data.num++
}, 500)

function observeMany() {
  for (let i = 0; i < 10000; i++) {
    const reaction = observe(() => {
      return data.num + data.array.reduce((sum, num) => sum + num, 0)
    })
    reactions.push(reaction)
  }
}

function unobserveMany() {
  for (let reaction of reactions) {
    unobserve(reaction)
  }
  reactions = []
  // this makes it not clean up properly!
  clearInterval(interval)
}

// const dataLogger = observe(() => console.log(data))

window.observeMany = observeMany
window.unobserveMany = unobserveMany
