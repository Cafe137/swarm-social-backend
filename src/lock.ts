import { System } from 'cafe-utility'

let waiting = 0
let locked = false

export async function acquireLock() {
    if (waiting > 128) {
        throw Error('Too many waiting locks')
    }
    waiting++
    while (locked) {
        await System.sleepMillis(1000)
    }
    locked = true
}

export function unlock() {
    waiting--
    locked = false
}
