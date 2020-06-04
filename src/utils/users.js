const users = []

const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
 
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return { user }   
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    return (index !== -1) ? users.splice(index, 1)[0] : undefined
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter(user => user.room === room.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
