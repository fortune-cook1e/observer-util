import { registerReactionForOperation, getReactionsForOperation, releaseReaction } from './store'

// reactions can call each other and form a call stack
const reactionStack = []
let isDebugging = false

/**
 * @description  执行 observe 函数的回调函数callback
 * @description observe(() => {}) // 立马执行回调函数
 * @param {*} reaction
 * @param {*} fn
 * @param {*} context
 * @param {*} args
 * @date 2022-10-13 10:20:36
 * @return {*}
 */
export function runAsReaction(reaction, fn, context, args) {
  // do not build reactive relations, if the reaction is unobserved
  if (reaction.unobserved) {
    return Reflect.apply(fn, context, args)
  }

  // only run the reaction if it is not already in the reaction stack
  // TODO: improve this to allow explicitly recursive reactions
  if (reactionStack.indexOf(reaction) === -1) {
    // release the (obj -> key -> reactions) connections
    // and reset the cleaner connections
    releaseReaction(reaction)

    // 执行完 reaction 之后立马弹出
    try {
      // set the reaction as the currently running one
      // this is required so that we can create (observable.prop -> reaction) pairs in the get trap
      reactionStack.push(reaction)
      return Reflect.apply(fn, context, args)
    } finally {
      // always remove the currently running flag from the reaction when it stops execution
      reactionStack.pop()
    }
  }
}

// register the currently running reaction to be queued again on obj.key mutations
export function registerRunningReactionForOperation(operation) {
  // get the current reaction from the top of the stack

  // 当observe的callback 涉及到一个target[key]的get操作时，此时 callback=reaction 正在执行
  const runningReaction = reactionStack[reactionStack.length - 1]
  if (runningReaction) {
    debugOperation(runningReaction, operation)
    registerReactionForOperation(runningReaction, operation)
  }
}

export function queueReactionsForOperation(operation) {
  // iterate and queue every reaction, which is triggered by obj.key mutation
  getReactionsForOperation(operation).forEach(queueReaction, operation)
}

function queueReaction(reaction) {
  debugOperation(reaction, this)
  // queue the reaction for later execution or run it immediately
  if (typeof reaction.scheduler === 'function') {
    reaction.scheduler(reaction)
  } else if (typeof reaction.scheduler === 'object') {
    reaction.scheduler.add(reaction)
  } else {
    reaction()
  }
}

function debugOperation(reaction, operation) {
  if (reaction.debugger && !isDebugging) {
    try {
      isDebugging = true
      reaction.debugger(operation)
    } finally {
      isDebugging = false
    }
  }
}

export function hasRunningReaction() {
  return reactionStack.length > 0
}
