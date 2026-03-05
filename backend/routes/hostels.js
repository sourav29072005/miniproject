const express = require("express");
const router = express.Router();
const Hostel = require("../models/Hostel");
const auth = require("../middleware/auth");


/* ---------------- ADD HOSTEL ---------------- */

router.post("/",auth,async(req,res)=>{

  try{

    const hostel = new Hostel(req.body);

    await hostel.save();

    res.status(201).json(hostel);

  }catch(err){

    res.status(500).json({error:"Failed to add hostel"});

  }

});


/* ---------------- GET HOSTELS ---------------- */

router.get("/",async(req,res)=>{

  try{

    const hostels = await Hostel.find().sort({createdAt:-1});

    res.json(hostels);

  }catch(err){

    res.status(500).json({error:"Server error"});

  }

});


/* ---------------- UPDATE HOSTEL ---------------- */

router.put("/:id",auth,async(req,res)=>{

  try{

    const updated = await Hostel.findByIdAndUpdate(

      req.params.id,
      req.body,
      {new:true}

    );

    res.json(updated);

  }catch(err){

    res.status(500).json({error:"Update failed"});

  }

});


/* ---------------- DELETE HOSTEL ---------------- */

router.delete("/:id",auth,async(req,res)=>{

  try{

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({message:"Hostel deleted"});

  }catch(err){

    res.status(500).json({error:"Delete failed"});

  }

});


module.exports = router;