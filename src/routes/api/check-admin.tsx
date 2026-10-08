import { db } from "@/lib/content";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return new Response(JSON.stringify({ isAdmin: false }), { status: 200 });

    const { data: isAdmin } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
    return new Response(JSON.stringify({ isAdmin: !!isAdmin }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ isAdmin: false }), { status: 500 });
  }
}
