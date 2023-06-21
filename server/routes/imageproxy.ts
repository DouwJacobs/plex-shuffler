import ImageProxy from "@server/lib/imageproxy";
import logger from "@server/logger";
import { Router } from "express";
import { getSettings } from "@server/lib/settings";
import { getRepository } from "@server/datasource";
import { User } from "@server/entity/User";

const router = Router();

const settings = getSettings();

const createImageProxy = async () => {
  const userRepository = getRepository(User);
  const admin = await userRepository.findOneOrFail({
    select: { id: true, plexToken: true },
    where: { id: 1 },
  });
  const plexImageProxy = new ImageProxy(
    "plex",
    `${settings.plex.useSsl ? "https" : "http"}://${settings.plex.ip}:${
      settings.plex.port
    }`,
    {
      rateLimitOptions: {
        maxRequests: 20,
        maxRPS: 50,
      },
      plexToken: admin.plexToken
    }
  );

  return plexImageProxy;
};

/**
 * Image Proxy
 */
router.get("/*", async (req, res) => {
  const imagePath = req.path.replace("/image", "");
  try {
    const plexImageProxy = await createImageProxy();
    const imageData = await plexImageProxy.getImage(imagePath);

    res.writeHead(200, {
      "Content-Type": `image/${imageData.meta.extension}`,
      "Content-Length": imageData.imageBuffer.length,
      "Cache-Control": `public, max-age=${imageData.meta.curRevalidate}`,
      "OS-Cache-Key": imageData.meta.cacheKey,
      "OS-Cache-Status": imageData.meta.cacheMiss ? "MISS" : "HIT",
    });

    res.end(imageData.imageBuffer);
  } catch (e) {
    logger.error("Failed to proxy image", {
      imagePath,
      errorMessage: e.message,
    });
    res.status(500).send();
  }
});

export default router;
