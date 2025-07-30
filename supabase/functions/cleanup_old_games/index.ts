import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Hardkodet Discord-webhook – beholdt som ønsket
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/xxx/yyy";

function sendDiscordLog(message: string) {
  return fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}

serve(async () => {
  const supabase = createClient(
    Deno.env.get("MY_SUPABASE_URL")!,
    Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cutoffTime = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  
  let gamesDeleted = 0;
  let betsDeleted = 0;
  let errors: string[] = [];

  try {
    // Slett gamle bets
    const { count: betsCount, error: betsError } = await supabase
      .from("bets")
      .delete()
      .lt("created_at", cutoffTime)
      .select("*", { count: "exact" });

    if (betsError) {
      errors.push(`Bets sletting feilet: ${betsError.message}`);
      await sendDiscordLog(`❌ Feil under sletting av gamle bets: ${betsError.message}`);
    } else {
      betsDeleted = betsCount ?? 0;
      console.log(`Slettet ${betsDeleted} gamle bets`);
    }

    // Slett gamle spill
    const { count: gamesCount, error: gamesError } = await supabase
      .from("games")
      .delete()
      .lt("created_at", cutoffTime)
      .select("*", { count: "exact" });

    if (gamesError) {
      errors.push(`Games sletting feilet: ${gamesError.message}`);
      await sendDiscordLog(`❌ Feil under sletting av gamle spill: ${gamesError.message}`);
    } else {
      gamesDeleted = gamesCount ?? 0;
      console.log(`Slettet ${gamesDeleted} gamle spill`);
    }

    if (errors.length === 0) {
      const message = `✅ Cleanup kjørt: ${gamesDeleted} spill og ${betsDeleted} bets slettet`;
      await sendDiscordLog(message);
      console.log(message);
      return new Response(message, { status: 200 });
    } else {
      const errorMessage = `⚠️ Cleanup kjørt med feil: ${errors.join(", ")}`;
      await sendDiscordLog(errorMessage);
      console.error(errorMessage);
      return new Response(errorMessage, { status: 500 });
    }

  } catch (error) {
    const errorMessage = `❌ Uventet feil under cleanup: ${error.message}`;
    await sendDiscordLog(errorMessage);
    console.error(errorMessage);
    return new Response(errorMessage, { status: 500 });
  }
});
