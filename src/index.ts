import * as core from '@actions/core'
import * as github from '@actions/github'
import { execSync } from 'child_process'

function main() {
  const tool = core.getInput('tool', { required: false }) as 'ncu' | 'taze'
  const email = core.getInput('email', { required: true })

  execSync(`npx ${ tool === 'ncu' ? 'npm-check-updates -u' : 'taze -w -r' }`)

  const gitStatus = execSync('git status').toString()
  if (!gitStatus.includes('working tree clean')) {
    core.info('Find new dependency(ies).\n')
    execSync('corepack enable')
    execSync('npm i @antfu/ni -g')
    execSync('ni --lockfile-only --frozen-lockfile=false')
    execSync(`git config user.name ${ github.context.actor }`)
    execSync(`git config user.email ${ email } }`)
    execSync('git add .')
    execSync('git commit -m "chore: update dependency."')
    execSync('git push')
  } else {
    core.info('Everything is up to date.\n')
  }
}

try {
  main()
} catch (error) {
  throw error as Error
}
