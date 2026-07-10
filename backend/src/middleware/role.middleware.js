import ApiResponse from "../utils/ApiResponse.js";


const authorizeRoles = (...roles)=>{

  return (req,res,next)=>{

    if(!req.user){

      return res.status(401).json(
        new ApiResponse(
          false,
          "Authentication required"
        )
      );

    }


    if(!roles.includes(req.user.role)){

      return res.status(403).json(
        new ApiResponse(
          false,
          "Access denied"
        )
      );

    }


    next();

  };

};


export default authorizeRoles;