import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET tutti gli oggetti
app.get("/api/items", async (req, res) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// POST un nuovo oggetto
app.post("/api/items", async (req, res) => {
  const { url, category } = req.body;
  const name = "Articolo generico"; // Da sostituire con scraping se vuoi in futuro
  const price = parseFloat((Math.random() * 100 + 10).toFixed(2)); // Prezzo random per ora

  const { data, error } = await supabase
    .from("items")
    .insert([{ name, price, url, category }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server attivo sulla porta " + PORT));
