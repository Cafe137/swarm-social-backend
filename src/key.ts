import { PrivateKey } from '@upcoming/bee-js'
import { log } from './logger'

export const SECRET_KEY = new PrivateKey('')

log(SECRET_KEY.publicKey().address().toHex())
