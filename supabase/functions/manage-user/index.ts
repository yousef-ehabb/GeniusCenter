import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function usernameToEmail(username: string): string {
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@tutor-erp.local`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { action, username, password, name, role } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "اسم المستخدم وكلمة المرور مطلوبان" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = usernameToEmail(username);

    if (action === "create") {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, username },
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ userId: data.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_password") {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find((u) => u.email === email);
      if (!user) {
        return new Response(JSON.stringify({ error: "المستخدم غير موجود" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find((u) => u.email === email);
      if (user) await supabase.auth.admin.deleteUser(user.id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "إجراء غير معروف" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
