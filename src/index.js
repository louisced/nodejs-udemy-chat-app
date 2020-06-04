const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
 
app.get('/', function (req, res) {
  res.render('index')
})

// let count = 0

io.on('connection', (socket) => {
  console.log('new WebSocket connection')

socket.on('join',(options, callback) => {
  const {error, user} = addUser({id:socket.id, ...options})
  
  if(error) return callback(error)
  
  socket.join(user.room)
  socket.emit('message', generateMessage('Admin', 'Welcome'))
  socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`))

  io.to(user.room).emit('roomData', {
    room: user.room,
    users: getUserInRoom(user.room)
  })
  
  callback()
})
  
socket.on('sendMessage', (message, callback) => {
  const user = getUser(socket.id)

  if(user){
    const filter = new Filter()
    if(filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }
    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback()
  }
})
    
socket.on('sendLocation', (coords, callback) => {
  const user = getUser(socket.id)

  if (user){
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.fr/maps?q=${coords.latitude},${coords.longitude}`))
    callback('Location shared')
  }
})

socket.on('disconnect',() => {

  const user = removeUser(socket.id)

  if(user){
    io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    })
  }
})

})
 
server.listen(port, () => {
  console.log(`Server up and runing on port: ${port}`)
})