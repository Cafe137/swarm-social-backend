import { Topic } from '@upcoming/bee-js'
import { bee } from './bee'
import { SECRET_KEY } from './key'
import { log } from './logger'
import { marshalPosts } from './memory'
import { getCurrentIdentifierWord } from './shared'
import { STAMP } from './stamp'

export async function publishPosts() {
    log('About to publish...')
    const result = await bee.uploadData(STAMP, marshalPosts())

    const feedWriter = bee.makeFeedWriter(Topic.fromString(getCurrentIdentifierWord()), SECRET_KEY)
    await feedWriter.upload(STAMP, result.reference)
    log('Published successfully')
}
