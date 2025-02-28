import { Bytes, EthAddress, NULL_ADDRESS, PrivateKey, Signature } from '@upcoming/bee-js'
import { Binary, Uint8ArrayReader } from 'cafe-utility'
import { bee } from './bee'
import { acquireLock, unlock } from './lock'
import { log } from './logger'
import { addPost, getPostTip } from './memory'
import { publishPosts } from './publisher'
import { STAMP } from './stamp'

export async function runServer() {
    const signer = new PrivateKey('')
    bee.gsocSubscribe(signer.publicKey().address(), NULL_ADDRESS, {
        onMessage: message => {
            safeHandleMessage(message)
        },
        onError: error => {
            console.error(error)
        }
    })
}

async function safeHandleMessage(message: Bytes) {
    await acquireLock()
    try {
        await handleMessage(message)
    } catch (error) {
        console.error(error)
    }
    unlock()
}

async function handleMessage(message: Bytes) {
    log('Handling message...')
    const reader = new Uint8ArrayReader(message.toUint8Array())
    const signature = new Signature(reader.read(65))
    const owner = new EthAddress(reader.read(20))
    const previousHash = reader.read(32)
    const payloadReference = reader.read(32)

    const publicKey = signature.recoverPublicKey(message.toUint8Array().slice(65))
    if (!Binary.equals(publicKey.address().toUint8Array(), owner.toUint8Array())) {
        throw Error('Invalid signature')
    }

    const currentHash = getPostTip()
    if (!Binary.equals(previousHash, currentHash)) {
        throw Error('Not a consecutive message')
    }

    const payload = await bee.downloadData(payloadReference)
    if (payload.length !== 64) {
        throw Error('Invalid cac')
    }

    const post = await bee.uploadData(STAMP, message.toUint8Array())
    addPost(post.reference)

    await publishPosts()
}
