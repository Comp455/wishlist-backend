import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();
const app = express();

const corsOptions = {
  origin: "https://wishlist-frontend-virid.vercel.app", // sostituisci con il tuo frontend Vercel se cambia
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function extractTitleFromHTML(html) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  if (match && match[1]) {
    return match[1].replace(" : Amazon.it: Libri", "").replace("| Amazon.it", "").trim();
  }
  return "Articolo sconosciuto";
}

app.get("/api/items", async (req, res) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post("/api/items", async (req, res) => {
  const { url, category, price } = req.body;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const name = extractTitleFromHTML(html);
    const parsedPrice = price || parseFloat((Math.random() * 100 + 10).toFixed(2));

    const { data, error } = await supabase
      .from("items")
      .insert([{ name, price: parsedPrice, url, category }])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Errore scraping:", err.message);
    res.status(500).json({ error: "Errore nel recupero dei dati", details: err.message });
  }
});

app.patch("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, category, url } = req.body;

  const { data, error } = await supabase
    .from("items")
    .update({ name, price, category, url })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase update error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) {
    console.error("❌ Supabase delete error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Server attivo sulla porta " + PORT));
