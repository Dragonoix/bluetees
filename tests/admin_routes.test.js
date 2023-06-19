const bluetees = require('../bluetees_unit_test')
const request = require("supertest");
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs')
jest.setTimeout(1200000)


const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`
let option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    }
mongoose.connect (URI, option)
mongoose.connection.on( 'error', () => {
  throw new Error(`unable to connect to database: `)
})

let token = '';
let adminUserId = '';
let roleId = '';
let customerId = '';
let golfClubBrandId = '';
let golfBallBrandId = '';
beforeAll(async() => {
});

//Admin Login
describe('Admin > Login', () => {
  it('Successful login with a 200 status code', async () => {
    const postData = { email: "superadmin@admin.com", password: "12345678" };  
    const res = await request(bluetees).post('/admin/login')
    .field("email", postData.email)
    .field("password", postData.password)
    expect(res.statusCode).toEqual(200)
    expect(res.body.data.email).toBe(postData.email)
    token = res.body.token
   })
   it('Authentication Failed email not found with a 400 status code', async () => {
    const postData = { email: "superadmin1@admin.com", password: "12345678" };  
    const res = await request(bluetees).post('/admin/login')
    .field("email", postData.email)
    .field("password", postData.password)
    expect(res.statusCode).toEqual(400)
   })
   it('Authentication Failed wrong password with a 400 status code', async () => {
    const postData = { email: "superadmin@admin.com", password: "123456789" };  
    const res = await request(bluetees).post('/admin/login')
    .field("email", postData.email)
    .field("password", postData.password)
    expect(res.statusCode).toEqual(400)
   })
})

//Admin Profile
describe('Admin > Profile', () => {
    it('Profile data fetch with a 200 status code', async () => {
        const res = await request(bluetees).get('/admin/profile')
        .set("token", token)
        expect(res.statusCode).toEqual(200)
       })
  })


//Admin Change Password
describe('Admin > Change Password', () => {
    it('Successful change password with a 200 status code', async () => {
      const postData = {old_password: "12345678" , password: "12345678" };  
      const res = await request(bluetees).post('/admin/change/password')
      .set("token", token)
      .field("old_password", postData.old_password)
      .field("password", postData.password)
      expect(res.statusCode).toEqual(200)
      })

      it('Sorry old password mismatch! with a 400 status code', async () => {
        const postData = {old_password: "12345679" , password: "12345678" };  
        const res = await request(bluetees).post('/admin/change/password')
        .set("token", token)
        .field("old_password", postData.old_password)
        .field("password", postData.password)
        expect(res.statusCode).toEqual(400)
     })
  })


//Admin Profile Update
describe('Admin > Profile Update', () => {
    it('Successful update profile with a 200 status code', async () => {
      const postData = {name: "Shaun Alexander"};  
      const res = await request(bluetees).put('/admin/update/profile/5ff30ac3026424da732696aa')
      .set("token", token)
      .field("name", postData.name)
      expect(res.statusCode).toEqual(200)
      })
})

/* Admin User Unit Test */

//Admin User list
describe('Admin User > List', () => {
  it('Admin user list with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/admin-user/list')
      .set("token", token)
      .field("keyword", "")
      expect(res.statusCode).toEqual(200)
     })

     it('Admin user list keyword search with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/admin-user/list')
      .set("token", token)
      .field("keyword", "Test")
      expect(res.statusCode).toEqual(200)
     })

     it('Admin user list keyword search but no result with a 400 status code', async () => {
      const res = await request(bluetees).post('/admin/admin-user/list')
      .set("token", token)
      .field("keyword", "xxxxxx")
      expect(res.statusCode).toEqual(400)
     })
  })

  //Admin Role create
describe('Admin User > Create', () => {
  it('Admin user create with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/admin-user/create')
      .set("token", token)
      .field("name", "Test Adminuser")
      .field("role", "5ff30fa0026424da732724ce")
      .field("email", "testadminuser@yopmail.com")
      expect(res.statusCode).toEqual(200)
      adminUserId = res.body.data._id
     })
  }) 
  
  describe('Admin User > Profile', () => {    
     it('Admin user Profile data fetch with a 200 status code', async () => {
      const res = await request(bluetees).get('/admin/admin-user/'+adminUserId)
      .set("token", token)
      expect(res.statusCode).toEqual(200)
     })
  })   
  describe('Admin User > Profile Update', () => {    
     it('Admin user profile update with a 200 status code', async () => {
      const postData = {name: "Test Subadmin"};  
      const res = await request(bluetees).put('/admin/admin-user/'+adminUserId)
      .set("token", token)
      .field("name", postData.name)
      expect(res.statusCode).toEqual(200)
      })

      it('Admin user profile update email exist with a 400 status code', async () => {
        const postData = {isDeleted: false,email:"stest@yopmail.com",_id: adminUserId};  
        const res = await request(bluetees).put('/admin/admin-user/'+adminUserId)
        .set("token", token)
        .field("email", postData.email)
        .field("_id", postData._id)
        .field("isDeleted", postData.isDeleted)
        expect(res.statusCode).toEqual(400)
        })
})


//Admin Role list
describe('Role > List', () => {
  it('Role list with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/role/list')
      .set("token", token)
      .field("keyword", "")
      expect(res.statusCode).toEqual(200)
      })
  }) 
  //Admin Role create
describe('Role > Create', () => {
  it('Role create with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/role/create')
      .set("token", token)
      .field("roleDisplayName", "Backend Role")
      expect(res.statusCode).toEqual(200)
      roleId = res.body.data._id
     })
  }) 
  //Admin Role Details
  describe('Role > Details', () => {    
    it('Role details with a 200 status code', async () => {
     const res = await request(bluetees).get('/admin/role/'+roleId)
     .set("token", token)
      expect(res.statusCode).toEqual(200)
     })
  })


  //Customer
describe('Customer > List', () => {
  it('Customer list with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/customer/list')
      .set("token", token)
      .field("keyword", "")
      expect(res.statusCode).toEqual(200)
      customerId = res.body.data[0]._id
     })

     it('Customer list keyword search with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/customer/list')
      .set("token", token)
      .field("keyword", "Test")
      expect(res.statusCode).toEqual(200)
     })

     it('Customer list keyword search but no result with a 400 status code', async () => {
      const res = await request(bluetees).post('/admin/customer/list')
      .set("token", token)
      .field("keyword", "xxxxxx")
      expect(res.statusCode).toEqual(400)
     })
  })

describe('Customer > Profile', () => {    
    it('Admin user Profile data fetch with a 200 status code', async () => {
     const res = await request(bluetees).get('/admin/customer/'+customerId)
     .set("token", token)
     expect(res.statusCode).toEqual(200)
    })
 })   
 describe('Customer > Profile Update', () => {    
    it('Customer profile update with a 200 status code', async () => {
     const postData = {first_name: "John", last_name: "Doe"};  
     const res = await request(bluetees).put('/admin/customer/'+customerId)
     .set("token", token)
     .field("first_name", postData.first_name)
     .field("last_name", postData.last_name)
     expect(res.statusCode).toEqual(200)
     })

     it('Customer profile update email exist with a 400 status code', async () => {
       const postData = {isDeleted: false,email:"stest@yopmail.com",_id: customerId};  
       const res = await request(bluetees).put('/admin/customer/'+customerId)
       .set("token", token)
       .field("email", postData.email)
       .field("_id", postData._id)
       .field("isDeleted", postData.isDeleted)
       expect(res.statusCode).toEqual(400)
       })
})
  
  //Admin Role Update
  // describe('Role > Update', () => {    
  //   it('Role update with a 200 status code', async () => {
  //    const postData = {roleDisplayName: "Customer",desc:"Customer of the application1"};  
  //    const res = await request(bluetees).put('/admin/role/'+roleId)
  //    .set("token", token)
  //    .field("roleDisplayName", postData.roleDisplayName)
  //    .field("desc", postData.desc)
  //    expect(res.statusCode).toEqual(200)
  //    })
  // })

//Admin Setting List
  describe('Setting > List', () => {
    it('Setting list with a 200 status code', async () => {
        const res = await request(bluetees).post('/admin/setting/list')
        .set("token", token)
        .field("keyword", "")
        expect(res.statusCode).toEqual(200)
       })
    }) 

 //Golf Club Brand List
 describe('Golf Club Brand > List', () => {
  it('Golf club brand list with a 200 status code', async () => {
      const res = await request(bluetees).post('/admin/golf-club-brand/list')
      .set("token", token)
      .field("keyword", "")
      expect(res.statusCode).toEqual(200)
     })
  }) 
  describe('Golf Club Brand > Create', () => {
    it('Golf club brand create with a 200 status code', async () => {
        const res = await request(bluetees).post('/admin/golf-club-brand/create')
        .set("token", token)
        .field("title", "Test Data")
        .attach('file', fs.readFileSync(`${__dirname}/download.jpeg`),'download.jpeg')
        expect(res.statusCode).toEqual(200)
        golfClubBrandId = res.body.data._id
       
       })
  }) 
  describe('Golf Club Brand > Details', () => {    
    it('Golf club brand details data fetch with a 200 status code', async () => {
     const res = await request(bluetees).get('/admin/golf-club-brand/'+golfClubBrandId)
     .set("token", token)
     expect(res.statusCode).toEqual(200)
    })
 })   
  
  //Golf Ball Brand List
  describe('Golf Ball Brand > List', () => {
    it('Golf ball brand list with a 200 status code', async () => {
        const res = await request(bluetees).post('/admin/golf-ball-brand/list')
        .set("token", token)
        .field("keyword", "")
        expect(res.statusCode).toEqual(200)
       })
    }) 

    describe('Golf Ball Brand > Create', () => {
      it('Golf ball brand create with a 200 status code', async () => {
          const res = await request(bluetees).post('/admin/golf-ball-brand/create')
          .set("token", token)
          .field("title", "Test Data")
          .attach('file', fs.readFileSync(`${__dirname}/download.jpeg`),'download.jpeg')
          expect(res.statusCode).toEqual(200)
          golfBallBrandId = res.body.data._id
         
         })
    }) 
    describe('Golf Ball Brand > Details', () => {    
      it('Golf ball brand details data fetch with a 200 status code', async () => {
       const res = await request(bluetees).get('/admin/golf-ball-brand/'+golfBallBrandId)
       .set("token", token)
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