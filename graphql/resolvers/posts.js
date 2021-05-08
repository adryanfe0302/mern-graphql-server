const { AuthenticationError } = require('apollo-server')
const Post = require('../../models/Post')
const checkAuth = require('../../util/check-auth')

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 })
                return posts;
            } catch(err) {
                throw new Error(err)
            }
        },
        async getPost(_,{ postId }) {
            try {
                const post = await Post.findById(postId)
                if(post){
                    return post
                } 
                throw new AuthenticationError('Action not allowed')

            } catch(err){
                throw new Error(err)
            } 
        }
        
    },
    Mutation: {
        async createPost(_,{ body }, context) {
            const user = checkAuth(context)
            // console.log('user', user)
            if(body.trim() === '') {
                throw new Error('Post body must not empty')
            }
            
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })
            
            const post = await newPost.save()
            context.pubsub.publish('NEW_POST', {
                newPost: post
            })
            return post
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context)
            try {
                const post = await Post.findById(postId)
                if (user.username === post.username){
                    await post.delete()
                    return ''
                }
                throw new AuthenticationError('action not allowed')
            } catch(err) {
                throw new Error(err)
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}