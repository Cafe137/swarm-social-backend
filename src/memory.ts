import { Reference } from '@upcoming/bee-js'
import { Arrays, Binary } from 'cafe-utility'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { getCurrentIdentifierWord } from './shared'

const posts: Reference[] = existsSync('posts.bin')
    ? Binary.partition(readFileSync('posts.bin'), 32).map(x => new Reference(x))
    : []
let lastIdentifierWord = ''

export function getPostTip(): Uint8Array {
    if (!posts.length) {
        return new Uint8Array(32)
    }
    return posts[0].toUint8Array()
}

export function addPost(post: Reference) {
    Arrays.unshiftAndLimit(posts, post, 128)
    writeFileSync('posts.bin', marshalPosts())
}

export function marshalPosts(): Uint8Array {
    const data = new Uint8Array(4096)
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        data.set(post.toUint8Array(), i * 32)
    }
    return data
}

export function needsNewIdentifierWord() {
    const currentIdentifierWord = getCurrentIdentifierWord()
    if (currentIdentifierWord !== lastIdentifierWord) {
        return true
    }
    return false
}

export function updateIdentifierWord(word: string) {
    lastIdentifierWord = word
}
