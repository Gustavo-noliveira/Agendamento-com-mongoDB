var appointment = require("../models/Appointment")
var mongoose = require("mongoose")
var AppointmentFactory = require("../factories/AppointmentFactory")
const mailer = require("nodemailer")

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {

  async Create(name, email, description, cpf, date, time) {
    var newAppo = new Appo({
      name,
      email,
      description,
      cpf,
      date,
      time,
      finished: false,
      notified: false
    })

    try {
      await newAppo.save();
      return true;
    } catch (err) {
      console.log(err)
      return false;
    }
  }

  async GetAll(showFinished) {
    if (showFinished) {
      return await Appo.find();
    } else {
      var appos = await Appo.find({ 'finished': false })
      var appointments = []

      appos.forEach(appointment => {
        appointments.push(AppointmentFactory.Build(appointment))
      })
      return appointments;
    }
  }

  async GetById(id) {
    var event = await Appo.findOne({ '_id': id })
    return event
  }

  async Finish(id) {
    await Appo.findByIdAndUpdate(id, { finished: true })
    return true;
  }

  async Search(query) {
    var appos = Appo.find().or([{ email: query }, { cpf: query }])
    return appos
    console.log(appos)
  }

  async sendNotification() {
    var appos = await this.GetAll(false)
    var transporter = mailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 25,
      auth: {
        user: "292ecb2c2f85a6",
        pass: "d123aad9342604"
      }
    })
    appos.forEach(async app => {

      var date = app.start.getTime();
      var hour = 1000 * 60 * 60; // *2 (2 horas), *3 (3horas)
      var gap = date - Date.now();

      if (gap <= hour) {

        if (!app.notified) {

          await Appo.findByIdAndUpdate(app.id, { notified: true })
          transporter.sendMail({
            from: "Gustavo Oliveira <gustavo@test.com.br>",
            to: app.email,
            subject: "Sua consulta vai acontecer em breve",
            text: "Sua consulta vai acontecer na próxima hora!!"
          }).then(data => {
            console.log(data)
          }).catch(err => {
            console.log(err)
          })
        }
      }

    })
  }
}

module.exports = new AppointmentService();