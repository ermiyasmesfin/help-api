const express = require("express");

  const router = express.Router();
 const {
    insertTicket,
    getTickets,
    getAllTickets,
    getTicket,
    getTicketById,
    updateClientReply,
    updateTechAssign,
    updateStatusClose,
    updateClose,
    deleteTicket,
    getTicketByIdTeam,
  } = require("../model/ticket/Ticket.model");
  const { userAuthorization,techAuthorization} = require("../middlewares/autherization.middleware");
  
  const {createNewTicketValidation, replyTicketMessageValidation,} 
  = require("../middlewares/formValidation.middleware");
  

 router.all("/",(req,res,next) => {
   // res.json({message:"return from ticket"});

    next();
 });



// create new ticket
router.post(
    "/",
   // createNewTicketValidation,
    userAuthorization,
    async (req, res) => {
      try {
        const { subject, sender, message } = req.body;
  
        const userId = req.userId;
  
        const ticketObj = {
          clientId: userId,
          subject,
          conversations: [
            {
              sender,
              message,
            },
          ],
        };
  
        const result = await insertTicket(ticketObj);
  
        if (result._id) {
          return res.json({
            status: "success",
            message: "New ticket has been created!",
          });
        }
  
        res.json({
          status: "error",
          message: "Unable to create the ticket , please try again later",
        });
      } catch (error) {
        res.json({ status: "error", message: error.message });
      }
    }
  );
  //get all tickets for teamleader
  router.get("/team", userAuthorization, async (req, res) => {
    try {
      // const userId = req.userId;
      const result = await getAllTickets();
  
      return res.json({
        status: "success",
        result,
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });

  //get all tickets for teamleader
  router.get("/qwertyuiop", userAuthorization, async (req, res) => {
    try {
      const userId = req.userId;
      const result = await getTicket(userId);
  
      return res.json({
        status: "success",
        result,
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });
  
  //get specific ticket for teamleader
  router.get("/team/:_id", userAuthorization, async (req, res) => {
    try {
      const { _id } = req.params;
  
      // const clientId = req.userId;
      const result = await getTicketByIdTeam(_id);
  
      return res.json({
        status: "success",
        result,
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });



   //get specific ticket for technicial
   router.get("/tech/:_id", userAuthorization, async (req, res) => {
    try {
      const { _id } = req.params;
  
      // const clientId = req.userId;
      const result = await getTicketByIdTeam(_id);
  
      return res.json({
        status: "success",
        result,
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });




  // Get all tickets for a specific user
  router.get("/", userAuthorization, async (req, res) => {
    try {
      const userId = req.userId;
      const result = await getTickets(userId);
  
      return res.json({
        status: "success",
        result,
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });
  
  // Get all tickets for a specific user
  router.get("/:_id", userAuthorization, async (req, res) => {
    try {
      const { _id } = req.params;
  
      const clientId = req.userId;
      const result = await getTicketById(_id, clientId);
  
      return res.json({
        status: "success",
        result,
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });
  
  // update reply message form client
  router.put(
    "/:_id",
    replyTicketMessageValidation,
    userAuthorization,
    async (req, res) => {
      try {
        const { message, sender } = req.body;
        const { _id } = req.params;
        const clientId = req.userId;
  
        const result = await updateClientReply({ _id, message, sender });
  
        if (result._id) {
          return res.json({
            status: "success",
            message: "your message updated",
          });
        }
        res.json({
          status: "error",
          message: "Unable to update your message please try again later",
        });
      } catch (error) {
        res.json({ status: "error", message: error.message });
      }
    }
  );

// update reply message form technicial
router.put(
  "tech/:_id",
  replyTicketMessageValidation,
  userAuthorization,
  async (req, res) => {
    try {
      const { message, sender } = req.body;
      const { _id } = req.params;
      const clientId = req.userId;

      const result = await updateClientReply({ _id, message, sender });

      if (result._id) {
        return res.json({
          status: "success",
          message: "your message updated",
        });
      }
      res.json({
        status: "error",
        message: "Unable to update your message please try again later",
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  }
);



  
  // update ticket status to close
  router.patch("/close-ticket/:_id", userAuthorization, async (req, res) => {
    try {
      const { _id } = req.params;
      const clientId = req.userId;
  
      const result = await updateStatusClose({ _id, clientId });
  
      if (result._id) {
        return res.json({
          status: "success",
          message: "The ticket has been closed",
        });
      }
      res.json({
        status: "error",
        message: "Unable to update the ticket",
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });
  
  // Delete a ticket
  router.delete("/:_id", userAuthorization, async (req, res) => {
    try {
      const { _id } = req.params;
      const clientId = req.userId;
  
      const result = await deleteTicket({ _id, clientId });
  
      return res.json({
        status: "success",
        message: "The ticket has been deleted",
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });
  
   // assign ticket to technicial
   router.patch("/update/:_id", userAuthorization, async (req, res) => {
    try {

      const {  message } = req.body;

      // const message = req.userId;
      const { _id} = req.params;
      // const techName = req.techId;
        
      const result = await updateTechAssign({_id, message });
  
      if (result._id) {
        return res.json({
          status: "success",
          message: "The ticket has been assigned",
        });
      }
      res.json({
        status: "error",
        message: "Unable to assign the ticket",
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });

  // update ticket status to close
  router.patch("/close-ticket-tech/:_id", userAuthorization, async (req, res) => {
    try {
      const { _id } = req.params;
      // const clientId = req.userId;
  
      const result = await updateClose({ _id });
  
      if (result._id) {
        return res.json({
          status: "success",
          message: "The ticket has been closed",
        });
      }
      res.json({
        status: "error",
        message: "Unable to update the ticket",
      });
    } catch (error) {
      res.json({ status: "error", message: error.message });
    }
  });
 
  
  


module.exports=router;