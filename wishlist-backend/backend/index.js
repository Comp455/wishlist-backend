
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/api/items", async (req, res) => {
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post("/api/items", async (req, res) => {
  const { url, category } = req.body;

  try {
    // Semplificato: estrazione nome e prezzo fittizi
    const name = "Articolo generico";
    const price = parseFloat((Math.random() * 100 + 10).toFixed(2));

    const { data, error } = await supabase
      .from("items")
      .insert([{ name, price, url, category }])
      .select()
      .single();

    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei dati" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server attivo sulla porta " + PORT));
