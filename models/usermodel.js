const mongoose = require('mongoose');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:3,
        max:20
    },
    email:{
      type:String,
      required:true,
      unique:true,
      match:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password:{
        type:String,
        required:true,
        min:8,
        max:100
    },
    profilePicture:{
        type:String,
        max:50
    },

    coverPicture:{
        type:String,
        default:''
    },
    followers:{
        type:Array,
        default:[]
    },
    followings:{
        type:Array,
        default:[]
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    desc:{
        type:String,
        default:''
    },
    city:{
        type:String,
        max:50
    },
    from:{
        type:String,
        max:50
    },
    relationship:{
        type:Number,
        enum:[1,2,3]
    },
},
{timestamps:true}
);
module.exports = mongoose.model('usermodel',userSchema);