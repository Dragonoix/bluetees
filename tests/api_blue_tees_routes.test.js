const bluetees = require('../bluetees_unit_test')
const request = require("supertest");
const express = require('express');
const mongoose = require('mongoose');
jest.setTimeout(60000)

beforeAll(async() => {
    const mongoose = require('mongoose');
    const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`
    
    let option = {
    useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
    await mongoose.connect(URI, option);
});

//Golf club brand list
describe('Golf club brand list', () => {
  it('Should response with a 200 status code', async () => {
    const res = await request(bluetees).get('/api/bluetees/golf-club-brand/list')
    expect(res.statusCode).toEqual(200)
   })
})

//Golf ball brand list
describe('Golf ball brand list', () => {
  it('Should response with a 200 status code', async () => {
    const res = await request(bluetees).get('/api/bluetees/golf-ball-brand/list')
    expect(res.statusCode).toEqual(200)
   })
})

afterAll( async () => {
  try {
    await mongoose.connection.close()
  } catch (err) {
    console.log(err)
  }
})