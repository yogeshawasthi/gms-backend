const Gym = require('../Models/gym.js')


exports.register = (req, res) => {
    try{
        const {userName,password,gymName,profilePic,email} = req.body;


        
      const isExist = await  Gym.findOne({userName});

if (isExist){
    res.status(400).json({
        error:"User Already Exist"
    })
} else{
    const newGym = new Gym({userName,password,gymName,profilePic,email});
    await newGym.save();

    res.status(201).json({
        message:"User Created Successfully",success:yes",data:newGym});
        
        }
    })



}
}



    }catch(err){
        res.status(500).json({
            error:"Server Error"
        
        })
    
    }
}


exports.login = async(req, res) => {
    try{
        const {userName,password} = req.body;
        const gym = await Gym.findOne({userName});
        if(gym){
            
            res.json({message:"Login Successfull",success:"true",gym});
                
            }else{
                res.status(400).json({
                    error:"Invalid Credentials"
                })
            }
        }


    }catch(err){
        res.status(500).json({
            error:"Server Error"
        
        })

    }

    


        
      const isExist = await  Gym.findOne({userName});