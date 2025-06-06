const findAdminFunction = require("../../utils/findAdminFunction.js");

const adminLogout = async (req, res) => {
    try {
      console.log(req);
      res.clearCookie("AdminToken", { httpOnly: true, secure: true, sameSite: "None" }); 
      res.status(200).json({ message: "Logged out Successfully" });
        
      
      const reqAdmin = await findAdminFunction(req.admin.adminId);
      console.log(reqAdmin.adminId,reqAdmin.name,"Logged out Successfully");
    } catch (error) {
      res.status(500).json({ message: "Cannot logout", error });
    }
  };

    module.exports=adminLogout;