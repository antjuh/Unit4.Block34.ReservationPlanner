const { client, createTables, createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservation, fetchReservations, destroyReservation } = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customers', async(req, res, next) => {
    try {
        res.send(await fetchCustomers());
    }catch(ex){
        next(ex);
    }
});
app.get('/api/restaurants', async(req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    }catch(ex){
        next(ex);
    }
});
app.get('/api/reservations', async(req, res, next) => {
    try {
        res.send(await fetchReservations());
    }catch(ex){
        next(ex);
    }
});
app.delete('/api/customers/:customer_id/reservations/:id', async(req, res, next) => {
    try {
        await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
        res.sendStatus(204);
    }catch(ex){
        next(ex);
    }
});
app.post('/api/customers/:customer_id/reservations', async(req, res, next) => {
    try {
        res.status(201).send(await createReservation({ customer_id: req.params.customer_id, restaurant_id: req.body.restaurant_id,
             date: req.body.date, party_count: req.body.party_count}));
    }catch(ex){
        next(ex);
    }
})



const init = async() => {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [Jay, Patrick, McDonalds, Applebees] = await Promise.all([
        createCustomer('Jay'),
        createCustomer('Patrick'),
        createRestaurant('McDonalds'),
        createRestaurant('Applebees'),
    ]);

    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    const [reservation, reservation2] = await Promise.all([
        createReservation({
            customer_id: Jay.id,
            restaurant_id: McDonalds.id,
            date: '02/14/2077',
            party_count: '1'
        }),
        createReservation({
            customer_id: Patrick.id,
            restaurant_id: Applebees.id,
            date: '04/18/24',
            party_count: '12'
        })
    ]);
    console.log(await fetchReservations());
    await destroyReservation({id: reservation.id, customer_id: reservation.customer_id});
    console.log(await fetchReservations());


    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
    });
};

init();