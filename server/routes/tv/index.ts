import PlexAPI from '@server/api/plexapi';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import { getLibraries } from '@server/lib/settings';
import { getPlexUrl } from '@server/utils';
import { Router } from 'express';

const tvRoutes = Router();

tvRoutes.get('/libraries', async (req, res) => {
  const tvLibraries = await getLibraries('show', req.user?.id);
  res.status(200).json(tvLibraries);
});

tvRoutes.get('/shows', async (req, res, next) => {
  const plexUrl = getPlexUrl();

  const userRepository = getRepository(User);

  if (!req.user) {
    return res.status(500).json({
      status: 500,
      error: 'Please sign in.',
    });
  }

  try {
    const tvLibraries = await getLibraries('show');

    // Support both libraryId (single, for backward compatibility) and libraryIds (comma-separated, for multi-select)
    const requestedLibID = req.query.libraryId as string | undefined;
    const requestedLibIDsRaw = req.query.libraryIds;
    // Handle string, number and array formats (Express can parse query params as arrays or numbers)
    let requestedLibIDs: string | undefined;
    if (requestedLibIDsRaw !== undefined && requestedLibIDsRaw !== null) {
      if (Array.isArray(requestedLibIDsRaw)) {
        requestedLibIDs = requestedLibIDsRaw.map(String).join(',');
      } else {
        requestedLibIDs = String(requestedLibIDsRaw);
      }
    }
    // Parsed library IDs are in `requestedLibIDs`

    const query = req.query.query as string;
    const genre = req.query.genre as string;
    const sortBy = req.query.sortBy as string;

    const admin = await userRepository.findOneOrFail({
      select: { id: true, plexToken: true },
      where: { id: 1 },
    });

    const itemsPerPage = 20;
    const page = Number(req.query.page) ?? 1;
    const offset = (page - 1) * itemsPerPage;

    const plexapi = new PlexAPI({ plexToken: admin.plexToken });
    const machineID = await plexapi.getIdentity();

    // Determine which libraries to fetch from
    let librariesToFetch: typeof tvLibraries = [];

    if (
      requestedLibIDs &&
      requestedLibIDs !== '' &&
      typeof requestedLibIDs === 'string'
    ) {
      // Multiple libraries specified (comma-separated)
      const libraryIdArray = requestedLibIDs
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id !== '');

      // If libraryIds is provided but empty after filtering, treat as "all libraries"
      if (libraryIdArray.length === 0 || libraryIdArray.includes('all')) {
        librariesToFetch = tvLibraries;
      } else {
        librariesToFetch = tvLibraries.filter((lib) =>
          libraryIdArray.includes(String(lib.id))
        );

        // Validate that all requested libraries exist
        if (librariesToFetch.length !== libraryIdArray.length) {
          return res.status(400).json({
            status: 400,
            error: 'One or more invalid library IDs',
          });
        }
      }
    } else if (requestedLibID && requestedLibID !== '') {
      // Single library specified (backward compatibility)
      const libraryExists = tvLibraries.some(
        (lib) => String(lib.id) === String(requestedLibID)
      );
      if (!libraryExists) {
        return res.status(400).json({
          status: 400,
          error: 'Invalid library ID',
        });
      }
      librariesToFetch = tvLibraries.filter(
        (lib) => String(lib.id) === String(requestedLibID)
      );
    } else {
      // No library specified, fetch from ALL libraries
      librariesToFetch = tvLibraries;
    }

    // Finished parsing requested libraries

    // If only one library is requested, use the simpler single-library path
    if (librariesToFetch.length === 1) {
      const libID = String(librariesToFetch[0].id);
      const result = await plexapi.getLibraryContents(libID, {
        offset,
        size: itemsPerPage,
        filter: query,
        genre,
        sortBy,
      });

      return res.status(200).json({
        page,
        totalPages: Math.ceil(result.totalSize / itemsPerPage),
        totalResults: result.totalSize,
        results: result.items.map((item) => ({
          ratingKey: item.ratingKey,
          url: `${plexUrl}/web/index.html#!/server/${machineID.machineIdentifier}/details?key=/library/metadata/${item.ratingKey}`,
          title: item.title,
          mediaType: 'tv',
          thumb: item.thumb,
          summary: item.summary,
        })),
      });
    }

    // Multiple libraries or all libraries - fetch and combine
    // Fetch from selected libraries in parallel
    // We need to fetch enough items to cover the requested page
    // Calculate how many items we need: (page * itemsPerPage) + some buffer
    const itemsNeeded = page * itemsPerPage;
    const fetchSize = Math.max(itemsNeeded + 100, 500); // Fetch enough to cover the page plus buffer, minimum 500

    const libraryResults = await Promise.all(
      librariesToFetch.map(async (library) => {
        try {
          const result = await plexapi.getLibraryContents(String(library.id), {
            offset: 0,
            size: fetchSize,
            filter: query,
            genre,
            sortBy,
          });
          return result.items;
        } catch (e) {
          // If a library fails, return empty array
          return [];
        }
      })
    );

    // Combine all results from all libraries
    let allItems = libraryResults.flat();

    // Apply client-side filtering if query is provided (since Plex API filter might not work perfectly across libraries)
    if (query) {
      const queryLower = query.toLowerCase();
      allItems = allItems.filter((item) =>
        item.title.toLowerCase().includes(queryLower)
      );
    }

    // Apply client-side sorting if sortBy is provided
    if (sortBy) {
      allItems.sort((a, b) => {
        switch (sortBy) {
          case 'titleSort':
            return (a.title || '').localeCompare(b.title || '');
          case 'addedAt:desc':
            return (b.addedAt || 0) - (a.addedAt || 0);
          case 'addedAt:asc':
            return (a.addedAt || 0) - (b.addedAt || 0);
          default:
            return 0;
        }
      });
    }

    // Apply pagination to combined results
    const totalResults = allItems.length;
    const totalPages = Math.ceil(totalResults / itemsPerPage);
    const paginatedItems = allItems.slice(offset, offset + itemsPerPage);

    return res.status(200).json({
      page,
      totalPages,
      totalResults,
      results: paginatedItems.map((item) => ({
        ratingKey: item.ratingKey,
        url: `${plexUrl}/web/index.html#!/server/${machineID.machineIdentifier}/details?key=/library/metadata/${item.ratingKey}`,
        title: item.title,
        mediaType: 'tv',
        thumb: item.thumb,
        summary: item.summary,
      })),
    });
  } catch (e) {
    next({ status: 500, message: e.message || 'Error fetching shows' });
  }
});

export default tvRoutes;
