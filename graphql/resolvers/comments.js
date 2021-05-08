const { UserInputError, AuthenticationError } = require('apollo-server')
const checkAuth = require('../../util/check-auth')
const Post = require('../../models/Post')

module.exports = {
    Mutation: {
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context)
            if (body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body must not empty'
                    }
                })
            }
            const post = await Post.findById(postId)
            if (post){
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                await post.save()
                return post
            } 
            throw new UserInputError('Post not found')
        },
        deleteComment:  async (_, { postId, commentId }, context) => {
          
            const { username } = checkAuth(context)
            console.log('post', username)
            const post = await Post.findById(postId)
            
            if (post){
                const commentindex = post.comments.findIndex(a => a.id === commentId)
                // console.log('post 1', commentindex)
                // console.log('post 2', post.comments[commentindex])
                if (post.comments[commentindex].username === username){
                    post.comments.splice(commentindex, 1)
                    await post.save()
                    return post
                }
                throw new AuthenticationError('Action not allowed')
            }
            throw new UserInputError('action not allowed')
        },
        likePost: async (_, { postId }, context) => {
            const { username } = checkAuth(context)
            const post = await Post.findById(postId)
            // console.log('user', post)
            if (post){
                if(post.likes.find((like) => like.username === username)){
                    //already liked, unlike it !
                    post.likes = post.likes.filter((like) => like.username !== username)
                } else {
                    // like it!
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save()
                return post
            }
            throw UserInputError('Post notfound')
        }
    }
}
