import { Router, type IRouter } from "express";
import { getDb, userProfilesTable } from "@workspace/db";
import { getUserFromBearerToken, isSupabaseConfigured } from "../lib/supabase";

const router: IRouter = Router();

router.get("/auth/session", async (req, res, next) => {
  try {
    if (!isSupabaseConfigured) {
      res.status(503).json({ configured: false, error: "Supabase is not configured." });
      return;
    }

    const user = await getUserFromBearerToken(req.headers.authorization);

    if (!user) {
      res.status(401).json({ configured: true, error: "Sign in required." });
      return;
    }

    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null;
    const avatarUrl =
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null;

    const [profile] = await getDb()
      .insert(userProfilesTable)
      .values({
        id: user.id,
        email: user.email ?? null,
        fullName,
        avatarUrl,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.id,
        set: {
          email: user.email ?? null,
          fullName,
          avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({
      configured: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
