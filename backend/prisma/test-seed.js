import prisma from "../src/config/database.js";


async function main(){

 const user = await prisma.user.create({
   data:{
     firstName:"Test",
     lastName:"User",
     email:"test@test.com",
     password:"hashedpassword"
   }
 });


 const flight = await prisma.flight.create({
   data:{
     flightNumber:"AI101",
     departure:"Chennai",
     arrival:"Delhi"
   }
 });


 const booking = await prisma.booking.create({
   data:{
     userId:user.id,
     flightId:flight.id,
     status:"CONFIRMED"
   }
 });


 await prisma.payment.create({
   data:{
     bookingId:booking.id,
     amount:5000,
     status:"PENDING"
   }
 });


}


main()
.finally(()=>prisma.$disconnect());