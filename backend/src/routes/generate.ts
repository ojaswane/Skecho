import Router from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Backend is live")
})

router.post("/", (req, res) => {
    res.json({ ok: true })
})
export default router;

// For Me:================
// post : ts is used when we have to send something see this like we see in the form of  i post on X daily 
// Get : we use ts when you need to get something like we need this data or look like for instagram it is operating the get operation 
// for the post which you have posted Got it?================