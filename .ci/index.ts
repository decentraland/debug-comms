import { createBucketWithUser } from 'dcl-ops-lib/createBucketWithUser'
import { createFargateTask } from 'dcl-ops-lib/createFargateTask'
import { database } from 'dcl-ops-lib/database'
import { env, envTLD } from 'dcl-ops-lib/domain'

export = async function main() {
  const revision = process.env['CI_COMMIT_SHA']
  const image = `decentraland/debug-comms:${revision}`

  const server = await createFargateTask(
    `debug-comms`,
    image,
    2500,
    [
    ],
    'debug-comms.decentraland.' + envTLD,
    {
      healthCheck: {
        path: '/health'
      },
    }
  )

  const publicUrl = server.endpoint

  return {
    publicUrl
  }
}
