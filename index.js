const express = require('express')
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vykpri2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect()
        const servicesCollection = client.db('doctors_web').collection('services')
        const bookingCollection = client.db('doctors_web').collection('bookings')

          /*
          api naming convention
          */ 
        app.get('/service', async(req, res)=>{
            const query= {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        });

          app.get('/available', async(req, res)=>{
            const date = req.query.date || 
            "Aug 13, 2022";



            const services = await servicesCollection.find().toArray();

            const query = {date: date};
            const bookings = await bookingCollection.find(query).toArray()

            services.forEach(service => {
              const servicebookings = bookings.filter(b => b.treatment === service.name)
              const booked = servicebookings.map(s => s.slot)
              const available = service.slots.filter(s => !booked.includes(s))
              // service.booked = booked;
              service.slots = available;
            })

            res.send(services)
          })


        app.post('/booking', async(req, res)=>{
          const booking = req.body;
          const query = {
            treatment: booking.treatment, date: booking.date, patient: booking.patient
          }
          const exixts = await bookingCollection.findOne(query)
          if(exixts){
            return res.send({success: false, booking: exixts})
          }
          const result = await bookingCollection.insertOne(booking)
         return res.send({success: true, result})
        })
    }
    finally{

    }
}

run().catch(console.dir)










app.get('/', (req, res) => {
  res.send('Hello From Doctor Uncle!')
})

app.listen(port, () => {
  console.log(`Doctor listening  ${port}`)
})