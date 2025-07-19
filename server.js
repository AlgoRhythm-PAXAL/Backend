const express =require("express");
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require("cors");
const cookieParser = require("cookie-parser");


// Import routes
const shipmentRoutes = require("./routes/shipmentRoutes");
const parcelRoutes = require("./routes/parcelRoutes");
const driverRoutes = require("./routes/driverRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
// const customerRoutes = require("./routes/customer");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staff/staffRoutes");
const parcelRoutesStaff = require("./routes/staff/parcelRoutes");

const pickupRoutes = require("./routes/staff/pickupRoutes");
const dropoffRoutes = require("./routes/staff/dropOffRoutes");
const userRoutes = require("./routes/staff/userRoutes");
const mobileRoutes = require("./routes/mobile");
const branchRoutes = require("./routes/branchRoutes");

//Deeraka
const globalErrorHandler = require("./controllers/errorController");
    const userRouter=require("./routes/userRoutes");
    const paymentRouter=require("./routes/paymentRoutes");
    const inquiryRoutes = require("./routes/inquiryRoutes"); 
   const AppError = require("./utils/appError");
    
   

const app = express();
const PORT = 8000;

// Middleware
 
app.use(
  cors({
    origin:[ "http://localhost:5173",// Your frontend URL
      'http://localhost:19006',       // Expo dev server
      'exp://192.168.43.246:19000' ],   // Your physical device
    credentials: true,// Allow credentials (cookies)
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); 

// Increase the size limit for incoming JSON and URL-encoded data (This is for image upload increasing the size of input)
app.use(bodyParser.json({ limit: "50mb" }));  // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(routes);


const db_URL=process.env.DB_URL;

mongoose.connect(db_URL)
.then(()=>{
    console.log("✅ Database connected successfully");
})
.catch((err)=>{
    console.log("❌ DB connection error",err)
})






// Route mounting
app.use("/shipments", shipmentRoutes);
app.use("/parcels", parcelRoutes);
app.use("/drivers", driverRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/standard-shipments", notificationRoutes);
app.use("/branches", branchRoutes);

app.use("/admin", adminRoutes);
// app.use("/", customerRoutes);
app.use("/staff", staffRoutes);
app.use("/staff/lodging-management", parcelRoutesStaff);
app.use("/staff/lodging-management", pickupRoutes);
app.use("/staff/lodging-management", dropoffRoutes);
app.use("/staff", userRoutes);
app.use("/api/mobile", mobileRoutes);


//users api urls
app.use("/api/auth",userRouter);
app.use("/api/parcels", parcelRoutes); // Use parcel routes
app.use("/api/payment",paymentRouter);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/branches', branchRoutes);



app.all("*",(req,res,next) => {
    next(new AppError('cant find ${req.originalUrl} on this server !',404) );
});
app.use(globalErrorHandler);

app.listen(PORT,()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
});
