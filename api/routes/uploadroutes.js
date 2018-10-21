const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Student = require("../models/student");
const Upload = require("../models/upload");



var minuteFromNow = function(){
    var d = new Date();
     d.setHours(d.getHours() + 5);
   d.setMinutes(d.getMinutes() + 30);
     var n = d.toLocaleString();
   return n;
  };


//upload a project [passed by email]
//http://localhost:3000/upload/project/email/


router.post("/project/email/:emailId", (req, res, next) => {
  //const email = req.params.emailId;
  Student.findOne({email:req.params.emailId})
    .then(email => {
      if (!email) {
        return res.status(404).json({
          message: "student not found for provided email"
        });
      }
      const upload = new Upload({
        _id: mongoose.Types.ObjectId(),
        git_proj_link: req.body.git_proj_link,
        description: req.body.description,
        domain: req.body.domain,
        category: req.body.category,
        title: req.body.title,
        email: req.params.emailId,
      });
      return upload.save();
    })
    .then(result => {
      console.log(result),
      Upload.updateOne,({email:req.params.email},{$set : { upload_time : minuteFromNow()}},function(err) {
        if(err) 
        {
           throw err;
        }
       } )
      res.status(201).json
      ({
        message: " PROJECT UPLOADED SUCCESSFULLY [passed by email]"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});




//to get all students projects yet to be approved 
//http://localhost:3000/upload/


router.get("/", (req, res, next) => {
  Upload.find()
  .select("email _id title git_proj_link description category domain upload_time ")
  //.populate('email')
  .exec()
  .then(docs => {
    const response = {
      TOTAL_NO_OF_PROJECTS_TO_BE_APPROVED: docs.length,
      COMPLETE_DETAILS: docs.map(doc => {
       return {
          id: doc._id,
          username:doc.username,
          email:doc.email,
          title :doc.title,
          git_proj_link: doc.git_proj_link,
          domain :doc.domain,
          description: doc.description,
          category:doc.category,
          upload_time: doc.upload_time
        };
        
      })
    };
    res.status(200).json(response);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});





//to get all students projects yet to be approved based on CATEGORY (icl/mca)
//http://localhost:3000/upload/category/

router.get("/category/:studentCategory", (req, res, next) => {
  category =req.params.studentCategory;
Upload.find({category})
  .select('email id title git_proj_link description domain category upload_time')
  .exec()
  .then(doc => {
    console.log("From database", doc);
    if (doc) 
    {
      res.status(200).json({
          PROJECT_CATEGORY : category,
          TOTAL_NO_OF_PROJECTS_UPLOADED_YET_TO_BE_APPROVED_OF_CATEGORY: doc.length,
          COMPLETE_DETAILS: doc
      });
    }
     else {
      res
        .status(404)
        .json({ message: "No projects found under provided the CATEGORY" });
    }
    
  })
  .catch
  (err => {
    console.log(err);
    res.status(500).json({ error: err });
  });
});



//to get all students projects yet to be approved based on DOMAIN (ai/ml/iot)
//http://localhost:3000/upload/domain/

router.get("/domain/:studentDomain", (req, res, next) => {
  domain =req.params.studentDomain;
Upload.find({domain})
  .select('email id title git_proj_link description domain category upload_time')
  .exec()
  .then(doc => {
    console.log("From database", doc);
    if (doc) 
    {
      res.status(200).json({
          PROJECT_DOMAIN : domain,
          TOTAL_NO_OF_PROJECTS_UPLOADED_YET_TO_BE_APPROVED_OF_DOMAIN: doc.length,
          COMPLETE_DETAILS: doc
      });
    }
     else {
      res
        .status(404)
        .json({ message: "No projects found under provided the DOMAIN" });
    }
    
  })
  .catch
  (err => {
    console.log(err);
    res.status(500).json({ error: err });
  });
});



//to get particular students all uploaded projects yet to be approved  (based on email)
//http://localhost:3000/upload/email/


router.get("/email/:studentEmail", (req, res, next) => {
  email =req.params.studentEmail;
  Upload.find({email})
    .select('email id title git_proj_link description domain category upload_time')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) 
      {
        res.status(200).json({
          STUDENT : email,
          TOTAL_NO_OF_PROJECTS_UPLOADED_YET_TO_BE_APPROVED: doc.length,
          COMPLETE_DETAILS: doc
        });
      }
       else {
        res
          .status(404)
          .json({ message: "No projects found for provided email" });
      }
      
    })
    .catch
    (err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});



//to get particular students recently uploaded proj (by recent)
//http://localhost:3000/upload/recent/email/

router.get("/recent/email/:userEmail", (req, res, next) => {
  email =req.params.userEmail;
  Upload.find({email}).sort({"upload_time": -1}).limit(1)
 
    .select('email id title git_proj_link description domain category upload_time')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) 
      {
        res.status(200).json({
          STUDENT : email,
          COMPLETE_DETAILS:doc
        });
      }
       else {
        res
          .status(404)
          .json({ message: "No recent projects found for provided email" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
 });

 //API TO DECLINE PROJECT (passing id)
 //http://localhost:3000/upload/delete/


router.delete("/delete/:uploadId", (req, res, next) => {
  const _id = req.params.uploadId;
  const message = req.body.message;
  Upload.deleteOne({_id})
    .exec()
    .then(result => {
      res.status(200).json({
          status: 'project declined',
          request:
           {
              type: 'DELETE',
              url: 'http://localhost:3000/upload',
              
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
    
});



module.exports = router;