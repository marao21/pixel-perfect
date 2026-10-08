ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS videos jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.custom_pages
SET videos = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('url', u, 'title', '', 'text', '')), '[]'::jsonb)
  FROM unnest(youtube_urls) AS u
)
WHERE (videos = '[]'::jsonb) AND youtube_urls IS NOT NULL AND array_length(youtube_urls, 1) > 0;

UPDATE public.custom_pages
SET videos = jsonb_build_array(jsonb_build_object('url', youtube_url, 'title', '', 'text', ''))
WHERE (videos = '[]'::jsonb) AND (youtube_urls IS NULL OR array_length(youtube_urls, 1) IS NULL) AND youtube_url IS NOT NULL;