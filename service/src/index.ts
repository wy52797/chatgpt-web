import express from 'express'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { isNotEmptyString } from './utils/is'
import { User } from './entities/User'

const app = express()
const router = express.Router()

const jwtAuth = expressjwt({ secret: 'jwtSecret', algorithms: ['HS256'] }).unless({ path: ['/login', '/register'] })
// const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: 'localhost',
//   port: 3306,
//   username: 'root',
//   password: '123456',
//   database: 'test',
//   entities: [User],
// })
const AppDataSource = new DataSource({
  type: 'mysql',
  host: '172.17.0.1',
  port: 3306,
  username: 'gpt',
  password: '5t8LyM7XpZpYzrpH',
  database: 'gpt',
  entities: [User],
})
app.use(jwtAuth)
app.use(express.static('public'))
app.use(express.json())

AppDataSource.initialize()
app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', async (req, res) => {
  const name = req.auth.name
  const userRepository = AppDataSource.getRepository(User)

  const user = await userRepository.findOneBy({ name })
  if (user.gpt_times <= 0)
    return res.send({ status: 'Fail', message: '提问次数已用完，请联系客服', data: null })

  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
    user.gpt_times -= 1
    await userRepository.save(user)
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/register', async (req, res) => {
  const { name, password } = req.body
  const userRepository = AppDataSource.getRepository(User)

  const existingUser = await userRepository.findOneBy({ name })
  if (existingUser)
    return res.send({ status: 'Fail', message: '用户名已存在', data: null })

  // 创建用户实体
  const user = new User()
  user.name = name
  user.password = password

  // 保存用户到数据库
  await userRepository.save(user)

  // 创建JWT并返回200状态码和JWT
  const token = jwt.sign({ name }, 'jwtSecret')
  res.send({ status: 'Success', message: '注册成功', data: { token } })
})

router.post('/login', async (req, res) => {
  const { name, password } = req.body
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOneBy({ name })
  if (!user || password !== user.password)
    return res.send({ status: 'Fail', message: '用户名或密码不正确', data: null })

  // 创建JWT并返回
  const token = jwt.sign({ name }, 'jwtSecret')
  res.send({ status: 'Success', message: '登录成功', data: { token } })
})

router.post('/info', async (req, res) => {
  const name = req.auth.name
  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOneBy({ name })
  res.send({ status: 'Success', message: '', data: { user } })
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
