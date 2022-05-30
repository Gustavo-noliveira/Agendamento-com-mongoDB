const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const appointmentService = require("./services/AppointmentService");
const AppointmentService = require("./services/AppointmentService");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/agendamento", { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false)

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/cadastro", (req, res) => {
    res.render("create")
})

app.get("/getcalendar", async (req, res) => {

    var appointments = await AppointmentService.GetAll(false);
    res.json(appointments)

    // CartFactory.Build(produtos, endereco)
})

app.post("/create", async (req, res) => {
    var status = await appointmentService.Create(
        req.body.name,
        req.body.email,
        req.body.description,
        req.body.cpf,
        req.body.date,
        req.body.time
    )

    if (status) {
        res.redirect("/")
    } else {
        res.send("Ocorreu uma falha")
    }
})

app.get("/event/:id", async (req, res) => {
    var appointment = await AppointmentService.GetById(req.params.id)
    res.render("event.ejs", { appo: appointment })

})

app.post("/finish", async (req, res) => {
    var id = req.body.id;
    await AppointmentService.Finish(id);
    res.redirect("/")
})

app.get("/list", async (req, res) => {

    var appos = await AppointmentService.GetAll(true);
    res.render("list", { appos })
})

app.get("/search", async (req, res) => {
    var appos = await AppointmentService.Search(req.query.search)
    res.render("list", { appos })
})

var pollTime = 5 * 60000

setInterval(async () => {

    await AppointmentService.sendNotification()

}, pollTime)

app.listen(8080, () => { });