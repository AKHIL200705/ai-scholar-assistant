// Supabase Edge Function: chat-ai
// Serves ChatGPT (OpenAI API) or Gemini completions securely from Supabase Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, model = "gpt-4o-mini", messages = [], apiKey } = await req.json();

    const openAiApiKey = apiKey || Deno.env.get("OPENAI_API_KEY");

    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({
          error: "No OpenAI API key provided. Set OPENAI_API_KEY in Supabase Secrets or send apiKey in request payload.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemMessage = {
      role: "system",
      content:
        "You are an expert AI Academic Tutor and Doubt Resolution Assistant. Provide clear, structured step-by-step answers with Markdown formatting, LaTeX formulas when relevant, and key takeaways.",
    };

    const chatHistory = messages.length > 0 ? messages : [{ role: "user", content: prompt }];

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [systemMessage, ...chatHistory],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await openAiResponse.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiMessage = data.choices?.[0]?.message?.content || "No response generated.";

    return new Response(
      JSON.stringify({
        answer: aiMessage,
        model: model,
        usage: data.usage,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
